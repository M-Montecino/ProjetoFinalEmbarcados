#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "APTO_303_2G";
const char* password = "vitor0802";

String servidor = "http://192.168.0.119:5000";

#define SS_PIN       D8
#define RST_PIN      D0
#define BUZZER_PIN   D4

// cuidado que o buzzer xia pra kct assim

#define LED_VERDE D1
#define LED_AMARELO D2
#define LED_VERMELHO D3

byte masterCard[4] = {0x7B, 0x7D, 0xF1, 0x06};

MFRC522 rfid(SS_PIN, RST_PIN);

bool registerMode = false;

// buzzer
  void BuzzerSucesso() {
    digitalWrite(LED_VERDE, HIGH);
    for (int i = 0; i < 2; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
    }
    digitalWrite(LED_VERDE, LOW);
  }

  void BuzzerNegado() {
    digitalWrite(LED_VERMELHO, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_VERMELHO, LOW);
  }

  void BuzzerTrocaModo() {
    digitalWrite(D2, !digitalRead(D2));
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
  }


  void BuzzerCadastro() {
    digitalWrite(LED_VERDE, HIGH);
    for (int i = 0; i < 3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(80);
      digitalWrite(BUZZER_PIN, LOW);
      delay(80);
    }
    digitalWrite(LED_VERDE, LOW);
  }


// leitor

  bool isAuthorized(byte *uid) {
    WiFiClient client;
    HTTPClient http;
    String body;
    String uidTexto = "";
    JsonDocument jsonEnvio;
    JsonDocument jsonResposta;
    String resposta;
  
    for (int i = 0; i < 4; i++) {
      if (uid[i] < 16) {
        uidTexto += "0";
      }

      uidTexto += String(uid[i], HEX);
    }

    jsonEnvio["uid"] = uidTexto;
    serializeJson(jsonEnvio, body);

    http.begin(client, servidor + "/check");
    http.addHeader("Content-Type", "application/json");

    int codigo = http.POST(body);

    if (codigo <= 0) {
      http.end();
      return false;
    }

    resposta = http.getString();
    http.end();

    deserializeJson(jsonResposta, resposta);

    return jsonResposta["authorized"];
  }

  void registerCard(byte *uid) {
    WiFiClient client;
    HTTPClient http;
    String body;
    String uidTexto = "";
    String resposta;

    JsonDocument jsonEnvio;
    JsonDocument jsonResposta;

    for (int i = 0; i < 4; i++) {
      if (uid[i] < 16) {
        uidTexto += "0";
      }

      uidTexto += String(uid[i], HEX);
    }

    jsonEnvio["uid"] = uidTexto;
    serializeJson(jsonEnvio, body);

    http.begin(client, servidor + "/register");
    http.addHeader("Content-Type", "application/json");

    int codigo = http.POST(body);

    if (codigo <= 0) {
      http.end();
      Serial.println("Erro na requisição.");
      return;
    }

    resposta = http.getString();
    http.end();

    deserializeJson(jsonResposta, resposta);

    if (jsonResposta["status"] == "already_exists") {
      Serial.println("Cartão já cadastrado.");
      return;
    }

    if (jsonResposta["status"] == "ok") {
      Serial.println("Cartão cadastrado com sucesso.");
      BuzzerCadastro();
    }
  }

void printUID(byte *uid, byte size) {
    for (byte i = 0; i < size; i++) {
      Serial.print(uid[i] < 0x10 ? " 0" : " ");
      Serial.print(uid[i], HEX);
    }
    Serial.println();
}

bool isMaster(byte *uid) {
  for (int i = 0; i < 4; i++) {
    if (uid[i] != masterCard[i]) return false;
  }
  return true;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  pinMode(LED_VERMELHO, OUTPUT);
  digitalWrite(LED_VERMELHO, LOW);

  pinMode(LED_AMARELO, OUTPUT);
  digitalWrite(LED_AMARELO, LOW);

  pinMode(LED_VERDE, OUTPUT);
  digitalWrite(LED_VERDE, LOW);

  SPI.begin();
  rfid.PCD_Init();

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("Sistema iniciado");
  Serial.println("Modo inicial: LEITURA");
  Serial.println("Aproxime o cartão Mestre para alternar modo");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("UID lido:");
  printUID(rfid.uid.uidByte, rfid.uid.size);

  if (isMaster(rfid.uid.uidByte)) {
    registerMode = !registerMode;

    Serial.println();
    if (registerMode) {
      Serial.println("=== MODO CADASTRO ===");
      Serial.println("Aproxime um cartão para cadastrar");
    } else {
      Serial.println("=== MODO LEITURA ===");
      Serial.println("Aproxime um cartão para validar");
    }

    BuzzerTrocaModo();

    delay(500);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    return;

  }

  if (registerMode) {
    registerCard(rfid.uid.uidByte);
  }

  else {
    if (isAuthorized(rfid.uid.uidByte)) {
      Serial.println("ACESSO LIBERADO");
      BuzzerSucesso();
    } else {
      Serial.println("ACESSO NEGADO");
      BuzzerNegado();
    }
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(500);
}