#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "roteador";
const char* password = "umabatata";

String servidor = "http://150.162.146.14:5000";

#define SS_PIN       D8
#define RST_PIN      D0
#define BUZZER_PIN   D4

// cuidado que o buzzer xia pra kct assim

#define LED_VERDE D1
#define LED_AMARELO D2
#define LED_VERMELHO D3

MFRC522 rfid(SS_PIN, RST_PIN);

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
    Serial.println(resposta);
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
      // enviar log de cadastro
      sendLog(uidTexto, "registered");
    }
  }

void sendLog(String uidTexto, String status) {
  WiFiClient client;
  HTTPClient http;
  String body;
  JsonDocument jsonEnvio;

  jsonEnvio["uid"] = uidTexto;
  jsonEnvio["status"] = status;
  serializeJson(jsonEnvio, body);

  http.begin(client, servidor + "/log");
  http.addHeader("Content-Type", "application/json");

  int codigo = http.POST(body);

  Serial.println(codigo);

  if (codigo <= 0) {
    Serial.println("Erro ao enviar log.");
    http.end();
    return;
  }

  String resposta = http.getString();
  http.end();
}

void printUID(byte *uid, byte size) {
    for (byte i = 0; i < size; i++) {
      Serial.print(uid[i] < 0x10 ? " 0" : " ");
      Serial.print(uid[i], HEX);
    }
    Serial.println();
}

bool getRegisterMode() {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, servidor + "/cadastro/status");
  int codigo = http.GET();
  if (codigo <= 0) {
    http.end();
    return false;
  }
  String resposta = http.getString();
  http.end();
  
  JsonDocument jsonResposta;
  deserializeJson(jsonResposta, resposta);
  return jsonResposta["cadastro_ativo"] | false;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("IP do ESP: ");
  Serial.println(WiFi.localIP());

  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());

  Serial.print("Mascara: ");
  Serial.println(WiFi.subnetMask());

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
  Serial.println("Controle de acesso online");
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

  bool registerMode = getRegisterMode();

  if (registerMode) {
    registerCard(rfid.uid.uidByte);
  }

  else {
    String uidTexto = "";
    for (int i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] < 16) {
        uidTexto += "0";
      }

      uidTexto += String(rfid.uid.uidByte[i], HEX);
    }

    if (isAuthorized(rfid.uid.uidByte)) {
      Serial.println("ACESSO LIBERADO");
      BuzzerSucesso();
      sendLog(uidTexto, "authorized");
    } else {
      Serial.println("ACESSO NEGADO");
      BuzzerNegado();
      sendLog(uidTexto, "denied");
    }
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(500);
}