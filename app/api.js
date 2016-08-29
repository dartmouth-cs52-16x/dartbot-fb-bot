import axios from 'axios';

const ROOT_URL = 'http://dartmouthbot.herokuapp.com/api';

export function getSurveys() {
  axios.get(`${ROOT_URL}/survey`).then(response => {
    console.log(response);
    return (response.data);
  }).catch(error => {
    console.log(error);
    return [];
  });
}
