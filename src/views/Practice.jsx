import { View, Text } from 'react-native'
import React from 'react'

const Practice = () => {

    const jsonData = {
        "Price and Terms": {
          "Listing Price": "₹12.5 Crores (₹5,000/sq. yd)",
          "Financing Options": [
            "Cash",
            "Mortgage",
            "Owner Financing Available"
          ],
          "Terms of Sale": [
            "10% Token Advance",
            "25% within 15 days",
            "Balance on Registration"
          ],
          "Payment Breakdown": {
            "Down Payment": "₹1.25 Crores",
            "Monthly Installments": "₹5 Lakhs for 18 months (if financed)",
            "Interest Rate": "9.5% APR (for owner financing)"
          },
          "Additional Costs": {
            "Closing Costs": "₹1.5 Lakhs",
            "Taxes": "6% Stamp Duty + Registration Charges",
            "Other Fees": "₹25,000 Legal Verification Fee"
          }
        }
      };
      const renderValue = (value) => {
        if (Array.isArray(value)) {
          return value.map((item, index) => (
            <Text key={index}>☑️ {item}</Text>
          ));
        } else if (typeof value === 'object') {
          return Object.entries(value).map(([subKey, subVal], idx) => (
            <Text key={idx}>☑️ {subKey}: {subVal}</Text>
          ));
        } else {
          return <Text>☑️ {value}</Text>;
        }
      };
            
  return (
    <View style={{ padding: 16 }}>
    {Object.entries(jsonData).map(([section, content]) => (
      <View key={section} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{section}</Text>
        {Object.entries(content).map(([key, value], i) => (
          <View key={i} style={{ marginBottom: 6 }}>
            {typeof value === 'string' && (
              <Text>☑️ {key}: {value}</Text>
            )}
            {Array.isArray(value) && (
              <>
                <Text>{key}:</Text>
                {renderValue(value)}
              </>
            )}
            {typeof value === 'object' && !Array.isArray(value) && (
              <>
                <Text>{key}:</Text>
                {renderValue(value)}
              </>
            )}
          </View>
        ))}
      </View>
    ))}
  </View>
  )
}

export default Practice