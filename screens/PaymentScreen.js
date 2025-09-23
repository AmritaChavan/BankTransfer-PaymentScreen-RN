/**
 * PaymentScreen (IBAN & SWIFT )
 */

import React, { useMemo, useReducer, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";

import Field from "../components/Field";
import Toggle from "../components/Toggle";
import CountryPickerModal from "../components/CountryPickerModal";

import COUNTRIES from "../Data/Countries";
import FX from "../Data/Fx";
import { isValidIban, isValidSwift, toNumber } from "../utils/validation";

/* ------------------------- Theme tokens ------------------------- */
const COLORS = {
  bg: "#0c1222",
  card: "#0f1933",
  border: "#1f2a4a",
  text: "#c5d1f0",
  textDim: "#a6b0cf",
  primary: "#3b82f6",
  success: "#22c55e",
  danger: "#ef4444",
  fxBg: "#0f1b36",
  fxBorder: "#20325a",
};

const TransferType = {
  DOMESTIC: "Domestic",
  INTERNATIONAL: "International",
};

/* ---------------------------- Form reducer ----------------------------- */
const initialForm = {
  name: "",
  bankName: "",
  accountNo: "",
  amountInInr: "",
  remark: "",
  country: "",
  iban: "",
  swift: "",
};

function formReducer(state, action) {
  switch (action.type) {
    case "set": {
      const { key, value } = action;
      return state[key] === value ? state : { ...state, [key]: value };
    }
    case "reset":
      return initialForm;
    default:
      return state;
  }
}

/* --------------------------- Main component ---------------------------- */
export default function PaymentScreen() {
  const [transferType, setTransferType] = useState(TransferType.DOMESTIC);
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [countryModal, setCountryModal] = useState(false);
  const [statusModal, setStatusModal] = useState({ visible: false, ok: true, ref: "" });
  const [footerH, setFooterH] = useState(64);

  const isInternational = transferType === TransferType.INTERNATIONAL;

  /* ---------------------------- Handlers -------------------------------- */

  const onChange = useCallback((key, value) => {
    if (key === "iban") {
      // IBAN: uppercase, alphanumeric only, exactly 34 max
      const cleaned = String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 34);
      dispatch({ type: "set", key, value: cleaned });
      return;
    }

    if (key === "swift") {
      // SWIFT: AAAA-BB-CC-1234
      let raw = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      raw = raw.slice(0, 12); // 12 chars before formatting

     
      let part1 = raw.slice(0, 4).replace(/[^A-Z]/g, "");  // letters only
      let part2 = raw.slice(4, 6).replace(/[^A-Z]/g, "");  // letters only
      let part3 = raw.slice(6, 8);                         // alphanumeric allowed
      let part4 = raw.slice(8, 12).replace(/[^0-9]/g, ""); // digits only

      let formatted = "";
      if (part1) formatted = part1;
      if (part2) formatted += "-" + part2;
      if (part3) formatted += "-" + part3;
      if (part4) formatted += "-" + part4;

      dispatch({ type: "set", key, value: formatted });
      return;
    }

    dispatch({ type: "set", key, value });
  }, []);

  const openCountry = useCallback(() => setCountryModal(true), []);
  const closeCountry = useCallback(() => setCountryModal(false), []);

  const onCountrySelect = useCallback((country) => {
    dispatch({ type: "set", key: "country", value: country.name });
    setCountryModal(false);
  }, []);

  const selectedCurrency = useMemo(() => {
    if (!isInternational) return "INR";
    const m = COUNTRIES.find((c) => c.name === form.country);
    return m ? m.currency : "USD";
  }, [isInternational, form.country]);

  const fx = useMemo(
    () => (typeof FX[selectedCurrency] === "number" ? FX[selectedCurrency] : 1),
    [selectedCurrency]
  );

  const amountInInr = useMemo(() => toNumber(form.amountInInr), [form.amountInInr]);

  const converted = useMemo(
    () => (isInternational ? amountInInr * fx : amountInInr),
    [isInternational, amountInInr, fx]
  );

  /* --------------------------- Validation -------------------------------- */

  const validateCommon = useCallback(() => {
    if (!form.name.trim()) return "Please enter recipient name.";
    if (!form.bankName.trim()) return "Please enter bank name.";
    if (!form.accountNo.trim()) return "Please enter account number.";
    if (!(amountInInr > 0)) return "Amount (INR) must be greater than 0.";
    return null;
  }, [form.name, form.bankName, form.accountNo, amountInInr]);

  const validateInternational = useCallback(() => {
    if (!form.country) return "Please select a country.";
    if (!form.iban.trim()) return "Please enter IBAN.";

    const ibanRaw = form.iban.toUpperCase();
    const ibanValidLength = ibanRaw.length === 34;
    const ibanAlnum = /^[A-Z0-9]{34}$/.test(ibanRaw);

    if (!(ibanValidLength && ibanAlnum && isValidIban(ibanRaw))) {
      return "IBAN must be exactly 34 alphanumeric characters.";
    }

    if (!form.swift.trim()) return "Please enter SWIFT code.";
    if (!isValidSwift(form.swift)) {
      return "SWIFT must match AAAA-BB-CC-1234 format (last 4 digits only).";
    }

    return null;
  }, [form.country, form.iban, form.swift]);

  /* ----------------------------- Actions --------------------------------- */

  const onPay = useCallback(() => {
    const commonErr = validateCommon();
    if (commonErr) return Alert.alert("Validation", commonErr);

    if (isInternational) {
      const intlErr = validateInternational();
      if (intlErr) return Alert.alert("Validation", intlErr);
    }

    const ok = Math.random() > 0.1; // simulate
    const ref = `TXN${Date.now().toString().slice(-8)}`;
    setStatusModal({ visible: true, ok, ref });
  }, [validateCommon, validateInternational, isInternational]);

  const onNewPayment = useCallback(() => {
    setStatusModal({ visible: false, ok: true, ref: "" });
    setTransferType(TransferType.DOMESTIC);
    dispatch({ type: "reset" });
  }, []);

  const onCloseStatus = useCallback(() => {
    setStatusModal((p) => ({ ...p, visible: false }));
  }, []);

  /* ------------------------------ Render --------------------------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: footerH + 16 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>
            One screen for Domestic & International transfers
          </Text>

          <Toggle
            options={[TransferType.DOMESTIC, TransferType.INTERNATIONAL]}
            value={transferType}
            onChange={setTransferType}
          />

          {/* Common fields */}
          <Field
            label="Name"
            placeholder="Beneficiary full name"
            value={form.name}
            onChangeText={(v) => onChange("name", v)}
          />

          <Field
            label="Bank Name"
            placeholder="e.g., HDFC Bank"
            value={form.bankName}
            onChangeText={(v) => onChange("bankName", v)}
          />

          <Field
            label="Account No."
            placeholder="Enter account number"
            keyboardType="number-pad"
            value={form.accountNo}
            onChangeText={(v) => onChange("accountNo", v)}
          />

          <Field
            label="Amount (INR)"
            placeholder="e.g., 10000"
            keyboardType="decimal-pad"
            value={form.amountInInr}
            onChangeText={(v) => onChange("amountInInr", v)}
          />

          {/* International-only fields */}
          {isInternational ? (
            <>
              <TouchableOpacity style={styles.select} onPress={openCountry}>
                <Text style={styles.selectLabel}>Country</Text>
                <Text style={[styles.selectValue, !form.country && styles.dim]}>
                  {form.country || "Select country"}
                </Text>
              </TouchableOpacity>

              <Field
                label="IBAN No."
                placeholder="Enter 34-character IBAN"
                autoCapitalize="characters"
                value={form.iban}
                onChangeText={(v) => onChange("iban", v)}
              />

              <Field
                label="SWIFT Code"
                placeholder="AAAA-BB-CC-1234"
                autoCapitalize="characters"
                value={form.swift}
                onChangeText={(v) => onChange("swift", v)}
              />

              <View style={styles.fxBox}>
                <Text style={styles.fxLine}>
                  Currency: <Text style={styles.fxMono}>{selectedCurrency}</Text>
                </Text>
                <Text style={styles.fxLine}>
                  Rate:{" "}
                  <Text style={styles.fxMono}>
                    1 INR = {fx} {selectedCurrency}
                  </Text>
                </Text>
                <Text style={styles.fxLine}>
                  Converted:{" "}
                  <Text style={styles.fxMono}>
                    {Number.isFinite(converted) ? converted.toFixed(2) : "-"}{" "}
                    {selectedCurrency}
                  </Text>
                </Text>
              </View>
            </>
          ) : null}

          <Text style={styles.label}>Remark</Text>
          <TextInput
            placeholder="Optional note for this payment"
            placeholderTextColor={COLORS.textDim}
            value={form.remark}
            onChangeText={(v) => onChange("remark", v)}
            style={[styles.input, styles.remark]}
            multiline
          />
        </ScrollView>

        <View
          style={styles.footer}
          onLayout={(e) =>
            setFooterH(Math.max(56, Math.ceil(e.nativeEvent.layout.height)))
          }
        >
          <TouchableOpacity onPress={onPay} style={styles.payBtn}>
            <Text style={styles.payText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={statusModal.visible}
        transparent
        animationType="fade"
        onRequestClose={onCloseStatus}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text
              style={[
                styles.statusIcon,
                { color: statusModal.ok ? COLORS.success : COLORS.danger },
              ]}
            >
              {statusModal.ok ? "✅" : "❌"}
            </Text>
            <Text style={styles.modalTitle}>
              {statusModal.ok ? "Payment Successful" : "Payment Failed"}
            </Text>

            <Text style={styles.modalText}>Type: {transferType}</Text>
            <Text style={styles.modalText}>
              Amount:{" "}
              {Number.isFinite(amountInInr)
                ? amountInInr.toLocaleString("en-IN")
                : "-"}{" "}
              INR
              {isInternational
                ? `  (~ ${
                    Number.isFinite(converted) ? converted.toFixed(2) : "-"
                  } ${selectedCurrency})`
                : ""}
            </Text>

            {isInternational ? (
              <>
                <Text style={styles.modalText}>Country: {form.country}</Text>
                <Text style={styles.modalText}>IBAN: {form.iban}</Text>
                <Text style={styles.modalText}>SWIFT: {form.swift}</Text>
              </>
            ) : null}

            <Text style={styles.modalText}>Ref: {statusModal.ref}</Text>
            {form.remark ? (
              <Text style={styles.modalText}>Remark: {form.remark}</Text>
            ) : null}

            <View style={styles.mt12} />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={onCloseStatus}>
                <Text style={styles.modalBtnText}>Close</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={onNewPayment}
              >
                <Text
                  style={[styles.modalBtnText, { color: "#60a5fa" }]}
                >
                  New Payment
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CountryPickerModal
        visible={countryModal}
        onClose={closeCountry}
        onSelect={onCountrySelect}
        countries={COUNTRIES}
      />
    </SafeAreaView>
  );
}

/* -------------------------------- Styles -------------------------------- */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16, flexGrow: 1, backgroundColor: COLORS.bg },
  title: { color: "white", fontSize: 22, fontWeight: "700" },
  subtitle: { color: COLORS.textDim, marginBottom: 12 },
  dim: { opacity: 0.5 },
  label: { color: COLORS.text, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
  },
  remark: { minHeight: 80, textAlignVertical: "top", marginBottom: 14 },
  select: {
    marginBottom: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectLabel: { color: COLORS.text, marginBottom: 6, fontWeight: "600" },
  selectValue: { color: "white" },
  fxBox: {
    backgroundColor: COLORS.fxBg,
    borderWidth: 1,
    borderColor: COLORS.fxBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  fxLine: { color: "#d8e1ff", marginBottom: 4 },
  fxMono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    color: "#c4f1ff",
  },
  footer: {
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  payText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  statusIcon: { textAlign: "center", fontSize: 42, marginBottom: 8 },
  modalTitle: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 6,
  },
  modalText: { color: COLORS.text, textAlign: "center", marginTop: 2 },
  mt12: { height: 12 },
  modalActions: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  modalBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  modalBtnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.primary },
  modalBtnText: { color: "white", fontWeight: "700" },
});
