import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from 'axios';
import xml2js from 'xml2js';
import DatePicker from "react-datepicker";
import './App.css';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment'
import tableJson from '../src/tableValues.json';
import countryJson from '../src/countryValues.json';
import currencyJson from '../src/currencyValues.json';
import { DragSwitch } from 'react-dragswitch';
import 'react-dragswitch/dist/index.css';

function App() {
  let [responseData, setResponseData] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [checked, setChecked] = useState(true)
  const { register, handleSubmit, getValues, control, setValue } = useForm({
    defaultValues: {
      fareFamily: "EcoSuperValue",
      sellerId: "TRAVELFUSIONIBETA",
      pointOfSale: "JP",
      currency: "GBP",
      cabin: "3"
    }
  });
  const tableData = [...tableJson];
  const countryData = [...countryJson];
  const currencyData = [...currencyJson];
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
    <RetailPartnerID>${getValues('sellerId')}</RetailPartnerID>
    </RetailPartner>
    </Sender>
    </Party>
    <PayloadAttributes>
    <PrimaryLangID>en</PrimaryLangID>
    <VersionNumber>18.2</VersionNumber>
    </PayloadAttributes>
    <PointOfSale>
    <Country>
    <CountryCode>${getValues('pointOfSale')}</CountryCode>
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
    ${checked ? 
      `<OriginDestCriteria>
      <DestArrivalCriteria>
      <IATALocationCode>${getValues('origin')}</IATALocationCode>
      </DestArrivalCriteria>
      <OriginDepCriteria>
      <Date>${getValues('toDate')}</Date>
      <IATALocationCode>${getValues('destination')}</IATALocationCode>
      </OriginDepCriteria>
      </OriginDestCriteria>` : ''}
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
    <RequestedCurCode>${getValues('currency')}</RequestedCurCode>
    </CurParameter>
    </ResponseParameters>
    <ShoppingCriteria>
    <CabinTypeCriteria>
    <CabinTypeCode>${getValues('cabin')}</CabinTypeCode>
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
          window.result = result;
           console.log(result);
            var response = result["soapenv:Envelope"]["soapenv:Body"]["ndc:IATA_AirShoppingRS"]["ndc:Response"];
            var dataList = response["ndc:DataLists"]
            var offerList = response["ndc:OffersGroup"]["ndc:CarrierOffers"]["ndc:Offer"]
            var priceClassList = dataList["ndc:PriceClassList"]["ndc:PriceClass"];
            var journeyId;
            var priceClassId = priceClassList.find(classList => classList["ndc:Code"] === `${getValues('fareFamily')}`)['ndc:PriceClassID']
            offerList.find(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"].find(arr => {
              if(arr["ndc:PriceClassRefID"] === priceClassId) {
                journeyId = arr["ndc:PaxJourneyRefID"];
              };
              return arr["ndc:PriceClassRefID"] === priceClassId
            }))
            var segmentId = dataList["ndc:PaxJourneyList"]["ndc:PaxJourney"].find(arr => arr["ndc:PaxJourneyID"] === journeyId)["ndc:PaxSegmentRefID"][0];
            var paxSegment = dataList["ndc:PaxSegmentList"]["ndc:PaxSegment"].find(arr => arr["ndc:PaxSegmentID"] === segmentId)
            var departureTime = paxSegment["ndc:Dep"]["ndc:AircraftScheduledDateTime"]
            var flightNumber = paxSegment["ndc:MarketingCarrierInfo"]["ndc:MarketingCarrierFlightNumberText"]
            var endResult = {Departure_Time : departureTime, Flight_Number : flightNumber}
            setResponseData(endResult);
        })
      
    }).catch(err=>{console.log(err)})
  }, [getValues,checked])

 

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
          OMS Web Portal
        </h1>
      </header>
      <div className="App-body">
      <div className="fares">
        <table className="fareTable">
          <thead>
            <tr>
              <th>Fare Family</th>
              <th>Change</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
          {tableData.map((data, key) => {
            return (
                <tr key={key}>
                  <td>{data.name}</td>
                  <td>{data.change}</td>
                  <td>{data.refund}</td>
                </tr>
              )
          })}
          </tbody>
        </table>
        </div>
         <div>  
          <form onSubmit={handleSubmit(onSubmitData)}>
              <div className="marginBottom">
                <label>
                  <span className="tripText">{checked ? 'Round Trip' : 'One Way'}</span>
                  <DragSwitch onColor='#ff7700' checked={checked} onChange={(e) => {setChecked(e)}} />
                </label>
            </div>
            <div>
            <Controller
              name="fromDate"
              control={control}
              defaultValue={fromDate}
              render={() => (
                <DatePicker
                  selected={fromDate}
                  placeholderText="*Depart Date"
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
                    placeholderText="*Return Date"
                    disabled = {!checked}
                    onChange={handleChangeTo}
                    popperProps={{
                      positionFixed: true
                    }}
                  />
                )}
              />
            <input
              type="text"
              name="origin"
              placeholder="*Leaving From"
              ref={register}
            />
            <input
              type="text"
              name="destination"
              placeholder="*Going To"
              ref={register}
            />
            </div>
            <div>
            <select placeholder="Cabin" name="cabin" ref={register}>
                <option value="3">Economy</option>
                <option value="4">Premium Economy</option>
                <option value="2">Business</option>
                <option value="1">First</option>
            </select>
            <select placeholder="Fare Family" name="fareFamily" ref={register}>
            {tableData.map((data, key) => {
              return (
                <option key={key} value={data.code}>{data.name}</option>
                )
              })}
          </select>
            <select placeholder="Seller ID" name="sellerId" ref={register}>
                <option value="TRAVELFUSIONIBETA">TRAVELFUSIONIBETA</option>
                <option value="TYOTA">TYOTA</option>
                <option value="GOOGLE">GOOGLE</option>
            </select>
            </div>
            <div>
            <select placeholder="Currency" name="currency" ref={register}>
              {currencyData.map((data, key) => {
                return (
                  <option key={key} value={data.value}>{data.name}</option>
                  )
                })}
            </select>
            <select placeholder="Point Of Sale" name="pointOfSale" ref={register}>
            {countryData.map((data, key) => {
                return (
                  <option key={key} value={data.value}>{data.name}</option>
                  )
                })}
            </select>
            <button type='submit' onClick={fetchData}>Get Flights</button>
          </div>
          </form>
        </div>
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