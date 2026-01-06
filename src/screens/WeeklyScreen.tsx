import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function WeeklyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Weekly Screen</Text>
      <Text style={styles.subtext}>Week grid will go here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
});
