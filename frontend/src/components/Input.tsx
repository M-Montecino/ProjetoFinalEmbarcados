import { StyleSheet, TextInput, TextInputProps } from "react-native";

export function Input({ ...rest }: TextInputProps) {
  return <TextInput style={styles.input} {...rest} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#537E72",
    backgroundColor: "#fdfdfd",
    borderRadius: 8,
    fontSize: 20,
    paddingLeft: 12,
    marginTop: 3,
  },
});
