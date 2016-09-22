<?xml version="1.0"?>
<xs:schema xmlns="http://www.w3.com" targetNamespace="http://www.w3.com" elementFormDefault="qualified">
  <xs:element name="forms">
    <xs:complexType>
      <xs:sequence/>
    </xs:complexType>
  </xs:element>
</xs:schema>