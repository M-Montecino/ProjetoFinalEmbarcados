import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

type ButtonProps = TouchableOpacityProps & {
  label: string;
};

export function Button({ label, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} {...rest}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#90B7BF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 6,
  },
  buttonText: {
    color: "#fdfdfd",
    fontSize: 20,
    fontWeight: "bold",
  },
});
