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
import { css } from '@emotion/react';
import { RingLoader } from 'react-spinners';

function App() {
    const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;
  let [responseData, setResponseData] = useState([]);
  let [resultTable, setResultTable] = useState(false);
  let [loading, setLoading] = useState(false);
  let [netError, setNetError] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [checked, setChecked] = useState(true);
  const tableData = [...tableJson];
  const countryData = [...countryJson];
  const currencyData = [...currencyJson];
  const { register, handleSubmit, getValues, errors, control, setValue } = useForm({
    defaultValues: {
      fareFamily: "EcoSuperValue",
      sellerId: "TRAVELFUSIONIBETA",
      pointOfSale: "JP",
      currency: "GBP",
      cabin: "3"
    }
  });
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
            var response = result["soapenv:Envelope"]["soapenv:Body"]["ndc:IATA_AirShoppingRS"]["ndc:Response"];
            window.result = response;
            var dataList = response["ndc:DataLists"];
            var offerList = response["ndc:OffersGroup"]["ndc:CarrierOffers"]["ndc:Offer"];
            var priceClassList = dataList["ndc:PriceClassList"]["ndc:PriceClass"];
            window.response = priceClassList;
            var priceClass = priceClassList.find(classList => classList["ndc:Code"] === `${getValues('fareFamily')}`);
            if(priceClass){
              var priceClassId = priceClass['ndc:PriceClassID'];
              if(!checked) {
                  var allJourneyArray = offerList
                    .filter(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"]["ndc:PriceClassRefID"] === priceClassId)
                    .map(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"]["ndc:PaxJourneyRefID"]);
                    var allSegmentResponse = dataList["ndc:PaxJourneyList"]["ndc:PaxJourney"];
                    var temp = [];
                    var allSegmentArray = [];
                    if(Array.isArray(allSegmentResponse)){
                       allSegmentResponse
                        .filter(arr => allJourneyArray.includes(arr["ndc:PaxJourneyID"]))
                        .map(arr => arr["ndc:PaxSegmentRefID"]);
                    }
                    else {
                      temp.push(allSegmentResponse);
                      allSegmentArray = temp
                        .filter(arr => allJourneyArray.includes(arr["ndc:PaxJourneyID"]))
                        .map(arr => arr["ndc:PaxSegmentRefID"]);
                    }
                    var allFlightResponse = dataList["ndc:PaxSegmentList"]["ndc:PaxSegment"];
                    var temp2 = [];
                    var allFlightArray = [];
                    if(Array.isArray(allFlightResponse)){
                      allFlightArray = allFlightResponse
                        .filter(arr => allSegmentArray.includes(arr["ndc:PaxSegmentID"]))
                        .map(arr => ({
                              flightNumber : arr["ndc:MarketingCarrierInfo"]["ndc:CarrierDesigCode"]+arr["ndc:MarketingCarrierInfo"]["ndc:MarketingCarrierFlightNumberText"],
                              departDate : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).reverse().pop().split('-').reverse().join("-"),
                              departTime : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).pop().split('-').reverse().join("-")
                            }));
                    }
                    else {
                      temp2.push(allFlightResponse);
                      allFlightArray = temp2
                        .filter(arr => allSegmentArray.includes(arr["ndc:PaxSegmentID"]))
                        .map(arr => ({
                              flightNumber : arr["ndc:MarketingCarrierInfo"]["ndc:CarrierDesigCode"]+arr["ndc:MarketingCarrierInfo"]["ndc:MarketingCarrierFlightNumberText"],
                              departDate : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).reverse().pop().split('-').reverse().join("-"),
                              departTime : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).pop().split('-').reverse().join("-")
                            }));
                    }
                    
                    setResponseData(allFlightArray);
                    setResultTable(true);
              }
              else {
                    var allJourneyOut = [...new Set(offerList
                      .filter(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"][0]["ndc:PriceClassRefID"] === priceClassId)
                      .map(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"][0]["ndc:PaxJourneyRefID"]))];
                    var allSegmentOut = dataList["ndc:PaxJourneyList"]["ndc:PaxJourney"]
                      .filter(arr => allJourneyOut.includes(arr["ndc:PaxJourneyID"]))
                      .map(arr => arr["ndc:PaxSegmentRefID"]);
                    var allOutSegStr = [];
                      allSegmentOut.forEach(el => {Array.isArray(el) ? allOutSegStr.push(el[0]) : allOutSegStr.push(el)});

                    var allJourneyRet = [...new Set(offerList
                      .filter(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"][1]["ndc:PriceClassRefID"] === priceClassId)
                      .map(temp => temp["ndc:JourneyOverview"]["ndc:JourneyPriceClass"][1]["ndc:PaxJourneyRefID"]))];
                    var allSegmentRet = dataList["ndc:PaxJourneyList"]["ndc:PaxJourney"]
                      .filter(arr => allJourneyRet.includes(arr["ndc:PaxJourneyID"]))
                      .map(arr => arr["ndc:PaxSegmentRefID"]);
                    var allRetSegStr = [];
                      allSegmentRet.forEach(el => {Array.isArray(el) ? allRetSegStr.push(el[0]) : allRetSegStr.push(el)});

                    var allOutFlightArray = dataList["ndc:PaxSegmentList"]["ndc:PaxSegment"]
                      .filter(arr => allOutSegStr.includes(arr["ndc:PaxSegmentID"]))
                      .map(arr => ({
                          flightNumber : arr["ndc:MarketingCarrierInfo"]["ndc:CarrierDesigCode"]+arr["ndc:MarketingCarrierInfo"]["ndc:MarketingCarrierFlightNumberText"]+"--Outbound",
                          departDate : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).reverse().pop().split('-').reverse().join("-"),
                          departTime : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).pop().split('-').reverse().join("-")
                        }));

                    var allRetFlightArray = dataList["ndc:PaxSegmentList"]["ndc:PaxSegment"]
                      .filter(arr => allRetSegStr.includes(arr["ndc:PaxSegmentID"]))
                      .map(arr => ({
                          flightNumber : arr["ndc:MarketingCarrierInfo"]["ndc:CarrierDesigCode"]+arr["ndc:MarketingCarrierInfo"]["ndc:MarketingCarrierFlightNumberText"]+"--Return",
                          departDate : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).reverse().pop().split('-').reverse().join("-"),
                          departTime : arr["ndc:Dep"]["ndc:AircraftScheduledDateTime"].split(/[A-Z]/).pop().split('-').reverse().join("-")
                        }));
                      
                      Array.prototype.push.apply(allOutFlightArray,allRetFlightArray);
                      setResponseData(allOutFlightArray);
                      setResultTable(true);
              }
            }
            else {
              setNetError(true);
            }
        })
      
      })
      .catch(err=>{
        setNetError(true);
        console.log(err)
      })
      .finally(function(){
        setLoading(false);
  })
}, [getValues,checked])


  useEffect(() => {
  }, [fetchData])

  const onSubmitData = (data) => {
    setResponseData([]);
    setResultTable(false);
    setNetError(false);
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
              <th>S.No</th>
              <th>Fare Family</th>
              <th>Change</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
          {tableData.map((data, key) => {
            return (
                <tr key={key}>
                  <td>{key+1}</td>
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
            <div className="dates">
              <Controller
                  name="fromDate"
                  control={control}
                  defaultValue={fromDate}
                  render={() => (
                    <DatePicker
                      selected={fromDate}
                      placeholderText="*Depart Date"
                      minDate={moment().toDate()}
                      onChange={handleChangeFrom}
                      required={true}
                      popperProps={{
                        positionFixed: true
                      }}
                    />
                  )}
                />
            </div>
            <div className="dates">
              <Controller
                  name="toDate"
                  control={control}
                  defaultValue={toDate}
                  render={() => (
                    <DatePicker
                      selected={toDate}
                      placeholderText="*Return Date"
                      minDate={fromDate}
                      disabled = {!checked}
                      required={true}
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
                  placeholder="*Leaving From"
                  ref={register({ required: true })}
                />
                <input
                  type="text"
                  name="destination"
                  placeholder="*Going To"
                  ref={register({ required: true })}
                />
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
                      <option key={key} value={data.code}>{key+1+` - `+data.name}</option>
                      )
                    })}
                </select>
                    <select placeholder="Seller ID" name="sellerId" ref={register}>
                    <option value="TRAVELFUSIONIBETA">TRAVELFUSIONIBETA</option>
                    <option value="TYOTA">TYOTA</option>
                    <option value="SELTA">SELTA</option>
                    <option value="PNHTA">PNHTA</option>
                    <option value="MEXTA">MEXTA</option>
                    <option value="LAXTA">LAXTA</option>
                    <option value="JKTTA">JKTTA</option>
                    <option value="FRATA">FRATA</option>
                    <option value="BOMTA">BOMTA</option>
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
              <div className="sweet-loading">
                  <button type='submit' onClick={() => {fetchData(); setLoading(true)}}>Get Flights</button>
                 <RingLoader color="#ff7700" loading={loading && !errors.origin && !errors.destination} css={override} size={70} />
                 {loading && !errors.origin && !errors.destination ? <span className="loadingText">Getting the best results...</span> : ''}
              </div>
              <span className="errorText">
                {errors.origin && " Error : Origin is required!"}<br></br>
                {errors.destination && " Error : Destination is required!"}<br></br>
                {netError ? 'Sorry!!! No flights available for this scenario': ''}
              </span>
          </div>
          </form>
          {resultTable ? 
          <div>
            <div className="resultTableDiv">
              <div className="tableHeader">
                <span >Available Flights : </span>
              </div>
                <table className="resultTable">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>FLight Number</th>
                      <th>Departure Date</th>
                      <th>Departure Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responseData.map((data, key) => {
                      return (
                          <tr key={key}>
                            <td>{key+1}</td>
                            <td>{data.flightNumber}</td>
                            <td>{data.departDate}</td>
                            <td>{data.departTime}</td>
                          </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div> 
            </div>
            : ''
            }
        </div>
      </div>
    </div>
  );
}

export default App;
