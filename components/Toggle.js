/**
 * Toggle
 * Simple toggle (Domestic / International).
 
 */
import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

function ToggleBase({ options = [], value, onChange }) {
  const handlePress = useCallback((opt) => onChange && onChange(opt), [onChange]);
  return (
    <View style={styles.row}>
      {options.map((opt, idx) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => handlePress(opt)}
            style={[styles.btn, active && styles.btnActive, idx === 0 ? { marginRight: 8 } : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const Toggle = memo(ToggleBase);
export default Toggle;

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 12 },
  btn: {
    flex: 1,
    backgroundColor: "#101a33",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2a4a",
    alignItems: "center",
  },
  btnActive: { 
    backgroundColor: "#1a2b55", 
    borderColor: "#3b5ccc" 
  },
  txt: { 
    color: "#a6b0cf", 
    fontWeight: "600" 
  },
  txtActive: { color: "#e5ecff" },
});
