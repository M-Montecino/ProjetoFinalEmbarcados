import { StyleSheet, TextInput, TextInputProps } from "react-native";

export function Input({ placeholderTextColor = "#F0F0F0", ...rest }: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor={placeholderTextColor} {...rest} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#363840",
    color: "#F0F0F0",
    borderRadius: 8,
    fontSize: 20,
    paddingLeft: 12,
    marginTop: 3,
  },
});
