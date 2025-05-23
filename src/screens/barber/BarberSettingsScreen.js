import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useSelector, useDispatch } from "react-redux";
import { setBarberData } from "../../redux/slices/barberSlice";
import InfoModal from "../../components/modals/InfoModal";
import DurationSelector from "../../components/DurationSelector";

const BarberSettingScreen = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const barberData = useSelector((state) => state.barber);
  const [selectedDuration, setSelectedDuration] = useState(30); // default to 30 min
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoText, setInfoText] = useState("");
  const [hairCutPrice, setHairCutPrice] = useState("");
  const [beardCutPrice, setBeardCutPrice] = useState("");
  const [bothCutPrice, setBothCutPrice] = useState("");
  const [childrenCutPrice, setChildrenCutPrice] = useState("");
  const [location, setLocation] = useState("");
  const [introVideo, setIntroVideo] = useState(null);
  const [hairDuration, setHairDuration] = useState(30);
  const [beardDuration, setBeardDuration] = useState(15);
  const [bothDuration, setBothDuration] = useState(45);
  const [kidsDuration, setKidsDuration] = useState(20);
  useEffect(() => {
    if (barberData) {
      const services = barberData.services || {};

      setHairCutPrice(services.hair?.toString() || "");
      setBeardCutPrice(services.beard?.toString() || "");
      setBothCutPrice(services.both?.toString() || "");
      setChildrenCutPrice(services.kids?.toString() || "");
      const durations = barberData.durations || {};
      setHairDuration(durations.hair || 30);
      setBeardDuration(durations.beard || 15);
      setBothDuration(durations.both || 45);
      setKidsDuration(durations.kids || 20);
      setLocation(barberData.location || "");
      setIntroVideo(barberData.introVideo || null);
    }
  }, [barberData]);

  const handleSave = async () => {
    if (!hairCutPrice || !location) {
      setInfoText("يرجى إدخال السعر والموقع على الأقل");
      setInfoVisible(true);
      return;
    }

    setIsSaving(true);
    try {
      const barberDocRef = doc(firestore, "barbers", userId);

      const updatedData = {
        services: {
          hair: parseInt(hairCutPrice),
          beard: parseInt(beardCutPrice || 0),
          both: parseInt(bothCutPrice || 0),
          kids: parseInt(childrenCutPrice || 0),
        },
        durations: {
          hair: hairDuration,
          beard: beardDuration,
          both: bothDuration,
          kids: kidsDuration,
        },
        location,
        introVideo,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(barberDocRef, updatedData, { merge: true });
      dispatch(setBarberData(updatedData));
      setHasChanges(false);
    } catch (error) {
      console.error("❌ Error saving barber data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.sectionBox}>
          <View style={styles.cutTypeBox}>
            <Text style={styles.label}>السعر لقص الشعر</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={hairCutPrice}
              onChangeText={(val) => {
                setHairCutPrice(val);
                setHasChanges(true);
              }}
              placeholder="مثال: 30"
            />
            <Text style={styles.label}>مدة الخدمة (بالدقائق)</Text>
            <DurationSelector
              selected={hairDuration}
              onSelect={(val) => {
                setHairDuration(val);
                setHasChanges(true);
              }}
            />
          </View>
          <View style={styles.cutTypeBox}>
            <Text style={styles.label}>السعر للذقن</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={beardCutPrice}
              onChangeText={(val) => {
                setBeardCutPrice(val);
                setHasChanges(true);
              }}
              placeholder="مثال: 25"
            />
            <Text style={styles.label}>مدة الخدمة (بالدقائق)</Text>
            <DurationSelector
              selected={beardDuration}
              onSelect={setBeardDuration}
            />
          </View>
          <View style={styles.cutTypeBox}>
            <Text style={styles.label}>السعر للشعر + الذقن</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bothCutPrice}
              onChangeText={(val) => {
                setBothCutPrice(val);
                setHasChanges(true);
              }}
              placeholder="مثال: 50"
            />
            <Text style={styles.label}>مدة الخدمة (بالدقائق)</Text>
            <DurationSelector
              selected={bothDuration}
              onSelect={(val) => {
                setBothDuration(val);
                setHasChanges(true);
              }}
            />
          </View>
          <View style={styles.cutTypeBox}>
            <Text style={styles.label}>السعر للأطفال</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={childrenCutPrice}
              onChangeText={(val) => {
                setChildrenCutPrice(val);
                setHasChanges(true);
              }}
              placeholder="مثال: 20"
            />
            <Text style={styles.label}>مدة الخدمة (بالدقائق)</Text>
            <DurationSelector
              selected={kidsDuration}
              onSelect={(val) => {
                setKidsDuration(val);
                setHasChanges(true);
              }}
            />
          </View>
        </View>
        <View style={styles.cutTypeBox}>
          <View style={styles.sectionBox}>
            <Text style={styles.label}>الموقع</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={(val) => {
                setLocation(val);
                setHasChanges(true);
              }}
              placeholder="المدينة أو اسم المحل"
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.saveButton,
          (!hasChanges || isSaving) && { backgroundColor: "#ccc" },
        ]}
        onPress={handleSave}
        disabled={!hasChanges || isSaving}
      >
        <Text style={styles.saveText}>
          {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </Text>
      </TouchableOpacity>

      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={infoText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: "#edeeef",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#031417",
    textAlign: "right",
    fontFamily: "Cairo",
  },
  input: {
    borderWidth: 1,
    borderColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    textAlign: "right",
    fontFamily: "Cairo",
  },
  saveButton: {
    backgroundColor: "#009dff",
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Cairo",
  },
  cutTypeBox: {
    paddingVertical: 30,
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});

export default BarberSettingScreen;
