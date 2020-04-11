#include <ESP8266HTTPClient.h>
#include <esp8266wifi.h>

const char* SSID         = "wifi_ssid";
const char* PASSWORD     = "wifi_password";
const char* HTTP_URL     = "http://ip.to.server:3000/change-event";
const int   TIME_TO_WAIT = 1000;

int  PUSH_BUTTON = 16;
int  LED         = 4;
long pressMoment;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED, OUTPUT);
  pinMode(PUSH_BUTTON, INPUT);
  
  pressMoment = millis();
  digitalWrite(LED, LOW);

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { 
    Serial.println("Connecting...");
    delay(1000);  
  }
  Serial.println("Connected!");
}

void loop() {    
  int buttonValue = digitalRead(PUSH_BUTTON);

  if (buttonValue == HIGH && waitedTime(pressMoment)) {
    Serial.println("Pushed");
    httpRequest();
    pressMoment = millis();
  }
}

void httpRequest () {
    digitalWrite(LED, HIGH);
    
    if (WiFi.status() == WL_CONNECTED) {
      
      HTTPClient http;
      http.begin(HTTP_URL);
      http.addHeader("Content-Type", "text/plain");
      
      int httpCode = http.POST("");

      if (httpCode == 200) {
        String payload = http.getString();
        Serial.println(payload);  
      } else {
        Serial.println("Bad request");
      }
    } else {
      Serial.println("Wifi not connected");
    }

    digitalWrite(LED, LOW);  
}

boolean waitedTime(long pressMoment) {
  return (millis() - pressMoment) > TIME_TO_WAIT; 
}
