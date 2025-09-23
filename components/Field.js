/**
 * Field
 * Reusable labeled TextInput for single/multi-line inputs.
 */
import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

function FieldBase({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
  multiline = false,
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8fa0c5"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline]}
        multiline={multiline}
      />
    </View>
  );
}

const Field = memo(FieldBase);
export default Field;

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: "#c5d1f0", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#0f1933",
    borderWidth: 1,
    borderColor: "#1f2a4a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
});
