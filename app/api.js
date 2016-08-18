import axios from 'axios';

const ROOT_URL = 'http://dartmouthbot.herokuapp.com/api';

export function getLocations() {
  axios.get(`${ROOT_URL}/locs`)
  .then(response => {
    return response.data;
  }).catch(error => {
    console.log(error);
  });
}
