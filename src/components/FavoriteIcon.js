import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from "react-redux";
import { addFavorite, removeFavorite } from "../redux/slices/favoritesSlice";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firestore } from "../firebase";
import AuthModal from "./modals/AuthModal"; // ✅ Use AuthModal instead of two modals
import InfoModal from "./modals/InfoModal";
const FavoriteIcon = ({ barberId }) => {
  const { isLoggedIn, userId } = useSelector((state) => state.user);
  const { favorites } = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const isFavorite = favorites.includes(barberId);

  const handleFavoritePress = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true); // ✅ Open AuthModal if user is not logged in
      return;
    }

    if (!barberId) {
      console.error("barberId ID is undefined");
      return;
    }

    try {
      const clientRef = doc(firestore, "clients", userId);
      const clientDoc = await getDoc(clientRef);

      if (clientDoc.exists()) {
        const favorites = clientDoc.data().favorites || [];

        if (!isFavorite) {
          if (favorites.length < 10) {
            await updateDoc(clientRef, {
              favorites: arrayUnion(barberId),
            });
            dispatch(addFavorite(barberId));
          } else {
            setInfoVisible(true);
          }
        } else {
          await updateDoc(clientRef, {
            favorites: arrayRemove(barberId),
          });
          dispatch(removeFavorite(barberId));
        }
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleFavoritePress}>
        <Icon
          name={isFavorite ? "heart" : "heart-outline"}
          size={30}
          color={isFavorite ? "#009dff" : "#009dff"}
        />
      </TouchableOpacity>

      {/* ✅ AuthModal instead of two modals */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <InfoModal
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        message={"للاسف، تستطيع اضافة 10 معلمين فقط كاقصى حد"}
      />
    </>
  );
};

export default FavoriteIcon;
