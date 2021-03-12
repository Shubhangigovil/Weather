import React, { Component } from 'react';
import { SafeAreaView, Animated, Easing, StyleSheet, ScrollView, View, Text, StatusBar, PermissionsAndroid, Button, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { create } from 'apisauce'
import LottieView from 'lottie-react-native';



export default class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      Latitude: 0,
      Longitude: 0,
      city: '',
      weather: '',
      temp: 0,
      DATA: [
        { day: 'Monday', temp: 0 },
        { day: 'Tuesday', temp: 0 },
        { day: 'Wednesday', temp: 0 },
        { day: 'Thursday', temp: 0 },
        { day: 'Friday', temp: 0 }
      ],
      err: false,
      progress: new Animated.Value(0),

    }
  }


  componentDidMount = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        , {
          title: 'Location Access Required',
          message: 'This App needs to Access your location',
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Deny",
          buttonPositive: "Allow"
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the location")
          Geolocation.getCurrentPosition((position) => {
            console.log("lasts is", position.coords.latitude)
            this.setState({
              Latitude: position.coords.latitude,
              Longitude: position.coords.longitude
            }, () => {
              this.GetWeather()
            })

          }, (error) => {
            Alert.alert("Location Denied",error.message.toString());
            // this.setState({
            //   err: true
            // })
          }, {
            showLocationDialog: true,
            enableHighAccuracy: false,
            timeout: 5000,
            forceRequestLocation: true,
            //maximumAge: 10000
          })
      } else {
        console.log("location permission denied")
        this.setState({
          err: true
        })
        Alert.alert("Denied", "Location permission denied!");
      }
    } catch (error) {
      Alert.alert(error.toString())
    }
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();

  }

  ErrorUI = () => {
    return (
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-evenly', }}>
        <Text style={styles.txtStyle}>Something Went Wrong at our End</Text>
        <TouchableOpacity
          // onPress={() => this.Retry()}
          style={{ height: 10, maxHeight: 60, width: Dimensions.get('window').width / 2.5, marginTop: 20, flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderColor: 'black', borderWidth: 2, fontSize: 20 }}>
          <Text style={{ color: 'black' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  LoaderUI = () => {
    return (
      <View style={{ flex: 1 }}>
        <LottieView source={require('./assets/226-splashy-loader.json')} progress={this.state.progress} colorFilters={[{
          keypath: "button",
          color: "#F00000"
        }, {
          keypath: "Sending Loader",
          color: "#F00000"
        }]}
          autoPlay
          loop />
      </View>
    )
  }

  // componentWillUnmount = () => {
  //   Geolocation.clearWatch(watchID)
  // }

  GetWeather = () => {
    const apiKey2 = "502de85ee25eb992eb16da2ac5d69271"

    const api = create({
      baseURL: 'https://api.openweathermap.org',
      // headers: { Accept: 'application/vnd.github.v3+json' },
    })

    api.get(`data/2.5/forecast?lat=${this.state.Latitude}&lon=${this.state.Longitude}&cnt=31&appid=${apiKey2}`)
      .then((response) => {
        if (response.data.list) {
          const newArray = [...this.state.DATA];
          newArray[1].temp = response.data.list[8].main.feels_like - 273.15;
          newArray[2].temp = response.data.list[14].main.feels_like - 273.15;
          newArray[3].temp = response.data.list[23].main.feels_like - 273.15;
          newArray[4].temp = response.data.list[30].main.feels_like - 273.15;
          newArray[0].temp = response.data.list[0].main.feels_like - 273.15;
          this.setState({
            city: response.data.city.name,
            weather: response.data.list[0].weather[0].description,
            temp: response.data.list[0].main.feels_like - 273.15,
            DATA: newArray
          })
        }
        else {
          this.setState({
            err: true
          })
        }
      })
      .catch((err) => {
        this.setState({
          err: true
        })
        console.error(err)
      })

  }
  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: 1,
          marginTop: 20,
          marginBottom: 10
        }}
      />
    )
  }

  renderList = ({ item }) => {
    return (
      <TouchableOpacity style={styles.tableStyle}>
        <Text style={styles.txtStyle2}>{item.day}</Text>
        <Text style={styles.txtStyle2}>{item.temp.toFixed(2)}</Text>
      </TouchableOpacity>
    )
  }

  render() {

    return (
      this.state.err ? this.ErrorUI() :
        this.state.Latitude != 0 ?
          <>
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}
                contentContainerStyle={{ alignItems: 'center', marginTop: '15%' }}>
                <Text style={styles.txtStyle}> {`${this.state.temp ? this.state.temp?.toFixed(2) : 0}\xB0C`}</Text>
                <Text style={styles.txtStyle}> {this.state.city}</Text>
                <Text style={styles.txtStyle}> {this.state.weather}</Text>

              </ScrollView>
              <View
                style={{
                  borderBottomColor: 'black',
                  borderBottomWidth: 1,
                  marginTop: 20,
                  marginBottom: 10
                }}
              />
              <FlatList
                data={this.state.DATA}
                renderItem={item => this.renderList(item)}
                keyExtractor={(item, index) => index + item}
                style={styles.flatListStyle}
                ItemSeparatorComponent={this.FlatListItemSeparator}
              />
            </SafeAreaView>
          </>
          : this.LoaderUI()
    );

  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  flatListStyle: {
    flex: 1,
  },
  txtStyle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700'
  },
  txtStyle2: {
    fontSize: 20,
    fontWeight: '300',
  },
  tableStyle: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-around', padding: 10
  }
})