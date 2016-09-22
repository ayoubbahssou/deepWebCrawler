<?xml version="1.0"?>
<xs:schema xmlns="http://www.w3.com" targetNamespace="http://www.w3.com" elementFormDefault="qualified">
  <xs:element name="forms">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="form 1">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="form-group">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="Keywords" type="xs:string"/>
                  </xs:sequence>
                </xs:complexType>
              </xs:element>
              <xs:element name="form-group fg-location">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="Location" type="xs:string"/>
                  </xs:sequence>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
        <xs:element name="form 2">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="form-group">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="Keywords" type="xs:string"/>
                  </xs:sequence>
                </xs:complexType>
              </xs:element>
              <xs:element name="form-group fg-location">
                <xs:complexType>
                  <xs:sequence>
                    <xs:element name="Keywords" type="xs:string"/>
                  </xs:sequence>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
        <xs:element name="form 3">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="q" type="xs:string"/>
              <xs:element name="l" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>