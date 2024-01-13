import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Thread } from "../../features/threads/Thread";

export default function ThreadPage() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Thread id={id?.toString()} />
    </View>
  )
}