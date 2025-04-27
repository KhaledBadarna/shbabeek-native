import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PrivacyPolicyModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* زر إغلاق */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#031417" />
          </TouchableOpacity>

          <Text style={styles.header}>سياسة الخصوصية وشروط الاستخدام</Text>

          {/* النص الكامل داخل ScrollView */}
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={styles.text}>
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك أثناء استخدام تطبيق "تواصل
              مع شبابيك".
            </Text>

            <Text style={styles.text}>
              نحن لا نشارك معلوماتك الشخصية مع أي طرف ثالث، ولا نعرض رقم هاتفك
              للمستخدمين داخل التطبيق.
            </Text>

            <Text style={styles.text}>
              التطبيق يوفر فقط منصة لربط الطلاب مع المعلمين. نحن لا نتحمل أي
              مسؤولية عن تصرفات غير مسؤولة أو أي تعامل خارج نطاق التطبيق. تقع
              كامل المسؤولية القانونية على الأطراف المتعاملة (المعلم والطالب).
            </Text>

            <Text style={styles.text}>
              بالنسبة لسياسة إلغاء الدروس: يمكن إلغاء الدرس فقط قبل 12 ساعة على
              الأقل من موعد بدايته واسترداد المبلغ المدفوع. أما في حال تم
              الإلغاء خلال أقل من 12 ساعة قبل موعد الدرس، فلا يمكن استرجاع
              المال.
            </Text>

            <Text style={styles.text}>
              عمليات استرجاع المبالغ (إن وجدت) تتم من خلال التواصل مع فريق
              الدعم، وبعد مراجعة كل حالة بشكل مستقل. لا يضمن التطبيق الاسترجاع
              بشكل فوري أو أوتوماتيكي.
            </Text>

            <Text style={styles.text}>
              باستخدامك لهذا التطبيق، فإنك توافق على هذه السياسة وتلتزم بها.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: height * 0.8, // 80% من ارتفاع الشاشة
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
  },
  header: {
    fontSize: 20,
    fontFamily: "Cairo",
    fontWeight: "bold",
    color: "#031417",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    fontFamily: "Cairo",
    color: "#031417",
    textAlign: "right",
    marginBottom: 15,
    lineHeight: 22,
  },
});

export default PrivacyPolicyModal;
