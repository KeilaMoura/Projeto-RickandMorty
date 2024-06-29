import React from "react";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemedText } from "./ThemedText";

interface Character {
  id: number;
  name: string;
  species: string;
  image: string;
  liked: boolean;
}

interface CharacterCardProps {
  personagem: Character;
  onPress: () => void;
  onLike: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  personagem,
  onPress,
  onLike,
}) => {
  return (
    <TouchableOpacity
      style={styles.characterCard}
      onPress={onPress}
      key={personagem.id.toString()} // Definindo a chave única aqui
    >
      <Image source={{ uri: personagem.image }} style={styles.characterImage} />
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.characterName}>
            {personagem.name}
          </ThemedText>
          <ThemedText style={styles.characterSpecies}>
            {personagem.species}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={onLike} style={styles.heartIcon}>
          <Icon
            name={personagem.liked ? "heart" : "heart-outline"}
            size={26}
            color={personagem.liked ? "#FF6347" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  characterCard: {
    width: 312,
    height: 308,
    marginBottom: 20,
    backgroundColor: "#FFFFFF", // Cor de fundo fixa
    borderRadius: 4,
    overflow: "hidden",
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  characterImage: {
    width: 312,
    height: 232,
    resizeMode: "cover",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    height: 76,
  },
  textContainer: {
    flex: 1,
  },
  characterName: {
    fontSize: 19,
    fontWeight: 500,
    color: "#000000DE", // Cor do texto fixa
    width: 280,
  },
  characterSpecies: {
    fontSize: 14,
    color: "#00000099", // Cor do texto fixa
    marginBottom: 2,
  },
  heartIcon: {
    marginRight: 5,
  },
});

export default CharacterCard;
