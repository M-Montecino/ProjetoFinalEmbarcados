import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

type ButtonProps = TouchableOpacityProps & {
  label: string;
};

export function Button({ label, style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} {...rest}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#5b5c66",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 6,
  },
  buttonText: {
    color: "#F4F6F8",
    fontSize: 20,
    fontWeight: "bold",
  },
});
