import { StyleSheet, TextInput, TextInputProps } from "react-native";

export function Input({ ...rest }: TextInputProps) {
  return <TextInput style={styles.input} {...rest} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#363840",
    borderRadius: 8,
    fontSize: 20,
    paddingLeft: 12,
    marginTop: 3,
  },
});
