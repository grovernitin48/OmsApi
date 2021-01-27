import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from 'axios';
import xml2js from 'xml2js';
import DatePicker from "react-datepicker";
import './App.css';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment'

function App() {
  let [responseData, setResponseData] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const { register, handleSubmit, getValues, control, setValue } = useForm();

  const fetchData = useCallback(() => {
    let parser = new xml2js.Parser({explicitArray:false, mergeAttrs:true});
    let xmls=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Header/>
    <soapenv:Body>
    <IATA_AirShoppingRQ xmlns="http://www.iata.org/IATA/2015/00/2018.2/IATA_AirShoppingRQ">
    <Party>
    <Sender>
    <RetailPartner>
    <ContactInfo/>
    <RetailPartnerID>SKYSCANNER</RetailPartnerID>
    </RetailPartner>
    </Sender>
    </Party>
    <PayloadAttributes>
    <PrimaryLangID>en</PrimaryLangID>
    <VersionNumber>18.2</VersionNumber>
    </PayloadAttributes>
    <PointOfSale>
    <Country>
    <CountryCode>JP</CountryCode>
    </Country>
    </PointOfSale>
    <Request>
    <FlightCriteria>
    <OriginDestCriteria>
    <DestArrivalCriteria>
    <IATALocationCode>${getValues('destination')}</IATALocationCode>
    </DestArrivalCriteria>
    <OriginDepCriteria>
    <Date>${getValues('fromDate')}</Date>
    <IATALocationCode>${getValues('origin')}</IATALocationCode>
    </OriginDepCriteria>
    </OriginDestCriteria>
    <OriginDestCriteria>
    <DestArrivalCriteria>
    <IATALocationCode>${getValues('origin')}</IATALocationCode>
    </DestArrivalCriteria>
    <OriginDepCriteria>
    <Date>${getValues('toDate')}</Date>
    <IATALocationCode>${getValues('destination')}</IATALocationCode>
    </OriginDepCriteria>
    </OriginDestCriteria>
    </FlightCriteria>
    <Paxs>
    <Pax>
    <AgeMeasure>34</AgeMeasure>
    <PaxID>ADT-0</PaxID>
    <PTC>ADT</PTC>
    </Pax>
    </Paxs>
    <ResponseParameters>
    <CurParameter>
    <RequestedCurCode>USD</RequestedCurCode>
    </CurParameter>
    </ResponseParameters>
    <ShoppingCriteria>
    <CabinTypeCriteria>
    <CabinTypeCode>3</CabinTypeCode>
    </CabinTypeCriteria>
    </ShoppingCriteria>
    </Request>
    </IATA_AirShoppingRQ>
    </soapenv:Body>
    </soapenv:Envelope>`;
    axios.post('https://ana-latest-uat-api.openjawtech.com/ndc/182/AirShopping',
    xmls,
    {headers:
      {'Authorization' : 'Bearer 7f05414c-e095-37ad-a297-77db079e5ec2',
       'Content-Type': 'text/xml'}
    }).then(res=>{
      parser.parseString(res.data,
        function(err, result) {
           setResponseData(result);
        })
      
    }).catch(err=>{console.log(err)})
  }, [getValues])

 

  useEffect(() => {
    //fetchData()
  }, [fetchData])

  const onSubmitData = (data) => {
    //setDebug(data);
    console.log(data);
  };

  const handleChangeFrom = (dateChange) => {
    const date = moment(dateChange).format("YYYY-MM-DD").toString();
    setValue("fromDate", date, {
      shouldDirty: true
    });
    setFromDate(dateChange);
  };

  const handleChangeTo = (dateChange) => {
    const date = moment(dateChange).format("YYYY-MM-DD").toString();
    setValue("toDate", date, {
      shouldDirty: true
    });
   setToDate(dateChange);
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          OMS API Data Fetch
        </h1>
      </header>
      <div className="App-body">
      <form onSubmit={handleSubmit(onSubmitData)}>
        <div>
        <Controller
          name="fromDate"
          control={control}
          defaultValue={fromDate}
          render={() => (
            <DatePicker
              selected={fromDate}
              placeholderText="From date"
              onChange={handleChangeFrom}
              popperProps={{
                positionFixed: true
              }}
            />
          )}
        />
        <Controller
            name="toDate"
            control={control}
            defaultValue={toDate}
            render={() => (
              <DatePicker
                selected={toDate}
                placeholderText="To date"
                onChange={handleChangeTo}
                popperProps={{
                  positionFixed: true
                }}
              />
            )}
          />
      </div>
        <input
          type="text"
          name="origin"
          placeholder="Origin"
          ref={register}
        />
        <input
          type="text"
          name="destination"
          placeholder="Destination"
          ref={register}
        />
         <input
          type="text"
          name="fareFamily"
          placeholder="Fare Family"
          ref={register}
        />
      <button type='submit' onClick={fetchData}>Get Data</button>
      </form>
      </div>
      <pre>
        <code>
          {responseData && JSON.stringify(responseData, null, 4)}
        </code>
      </pre>
    </div>
  );
}

export default App;