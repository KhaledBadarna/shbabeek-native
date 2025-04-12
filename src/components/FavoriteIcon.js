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

const FavoriteIcon = ({ teacherId }) => {
  const { isLoggedIn, userId } = useSelector((state) => state.user);
  const { favorites } = useSelector((state) => state.favorites);
  const dispatch = useDispatch();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isFavorite = favorites.includes(teacherId);

  const handleFavoritePress = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true); // ✅ Open AuthModal if user is not logged in
      return;
    }

    if (!teacherId) {
      console.error("Teacher ID is undefined");
      return;
    }

    try {
      const studentRef = doc(firestore, "students", userId);
      const studentDoc = await getDoc(studentRef);

      if (studentDoc.exists()) {
        const favorites = studentDoc.data().favorites || [];

        if (!isFavorite) {
          if (favorites.length < 10) {
            await updateDoc(studentRef, {
              favorites: arrayUnion(teacherId),
            });
            dispatch(addFavorite(teacherId));
          } else {
            alert("You can only have up to 10 favorite teachers.");
          }
        } else {
          await updateDoc(studentRef, {
            favorites: arrayRemove(teacherId),
          });
          dispatch(removeFavorite(teacherId));
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
          name={isFavorite ? "bookmark" : "bookmark-outline"}
          size={30}
          color={isFavorite ? "#00e5ff" : "#031417"}
        />
      </TouchableOpacity>

      {/* ✅ AuthModal instead of two modals */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default FavoriteIcon;
