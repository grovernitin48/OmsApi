import React from "react";
import "./styles.css";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function App() {
  const [debug, setDebug] = React.useState();
  return (
    <div className="App">
      <EditMember setDebug={setDebug} />
      {debug && <Debug data={debug} />}
    </div>
  );
}
      
      {/* <main>
        {responseData &&
          <blockquote>
            "{responseData && responseData.content}"
            <small>{responseData && responseData.originator && responseData.originator.name}</small>
          </blockquote>
        }
        </main> */}
function EditMember({ setDebug }) {
  const { register, handleSubmit, control, setValue } = useForm();
  const [date, setDate] = React.useState(new Date(Date.now()));

  const onSubmitData = (data) => {
    setDebug(data);
    console.log(data);
  };

  const handleChange = (dateChange) => {
    setValue("dateOfBirth", dateChange, {
      shouldDirty: true
    });
    setDate(dateChange);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmitData)}>
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          ref={register}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          ref={register}
        />
        <span>Male</span>
        <input type="radio" value="Male" name="gender" ref={register} />
        <span>Female</span>
        <input type="radio" value="Female" name="gender" ref={register} />
        <input
          type="text"
          name="address"
          placeholder="Address"
          ref={register}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          ref={register}
        />
        <Controller
          name="dateOfBirth"
          control={control}
          defaultValue={date}
          render={() => (
            <DatePicker
              selected={date}
              placeholderText="Select date"
              onChange={handleChange}
              popperProps={{
                positionFixed: true
              }}
            />
          )}
        />

        <button type="submit">Edit Log</button>
      </form>
    </div>
  );
}

const Debug = ({ data }) => {
  return (
    <div className="debug">
      <p>Output</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
