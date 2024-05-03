import React, { useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useParams, uselocation } from 'react-router-dom'; 
import SearchList from '@generic/component/SearchList';

const SearchPage = (props) => {
  // const search = useLocation().search; 
  // const entityId = URLSearchParams(search).get('entityId'); 
  const initParams = (() => {
    // if(entityId) { 
    // return {entityId : entityId}; 
    // }else if (props.initParams) { 
    // return props.initParams;
    return props.initParams; 
  })(); 
  return <>{<SearchList initParams={initParams} />}</>; 
};
export default SearchPage;