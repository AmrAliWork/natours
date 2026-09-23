import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPassword = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgetPassword',
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Reset link sent to your email!');
    }
  } catch (err) {
    showAlert(
      'error',
      err.response?.data?.message || 'Something went wrong. Try again.'
    );
  }
};
