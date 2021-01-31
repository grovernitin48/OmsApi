import React from 'react';
import { css } from '@emotion/core';
import { ClipLoader } from 'react-spinners';

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

class LoadingIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }


  render() {
    return (
      <div className='sweet-loading' style={{marginTop:150}}>
        <ClipLoader
          css={override}
          sizeUnit={"px"}
          size={350}
          color={'#123abc'}
          loading={this.props.loading}
        />
        <h1>LOADING...</h1>
      </div> 
    )
  }
}

export default LoadingIndicator;
