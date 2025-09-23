/**
 * CountryPickerModal
 * A searchable modal list of countries.
 * - Filters by country name or currency code
 */
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Modal, SafeAreaView, View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";

const ROW_HEIGHT = 54;

export default function CountryPickerModal({ visible, onClose, onSelect, countries }) {
  const [query, setQuery] = useState("");

  // Clear search 
  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  // Filter by name or currency 
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.currency.toLowerCase().includes(q)
    );
  }, [query, countries]);

  // callbacks for FlatList
  const keyExtractor = useCallback((item) => `${item.name}-${item.currency}`, []);
  const getItemLayout = useCallback((_, index) => {
    const length = ROW_HEIGHT;
    const offset = length * index;
    return { length, offset, index };
  }, []);
  const renderItem = useCallback(
    ({ item }) => (
      <Pressable style={styles.row} onPress={() => onSelect(item)}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.cur}>{item.currency}</Text>
      </Pressable>
    ),
    [onSelect]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Country</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Search country or currency code"
            placeholderTextColor="#a6b0cf"
            style={styles.search}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Results */}
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={8}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0b1220",
  },
  title: { color: "white", fontSize: 18, fontWeight: "700" },
  close: { color: "#8fb3ff", fontWeight: "700" },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  search: {
    backgroundColor: "#0f1933",
    borderWidth: 1,
    borderColor: "#1f2a4a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
  },
  row: {
    height: ROW_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0b1220",
  },
  sep: { height: 1, backgroundColor: "#1b243a" },
  name: { color: "#e5ecff", fontSize: 16 },
  cur: { color: "#9fb2e5", fontWeight: "700" },
});
