import { deleteFacture } from '../pages/delete';
//import { handleSubmit } from '../pages/formulaire';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';



jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  const MockDateTimePicker = (props) => <View {...props} testID="mockDateTimePicker" />;
  return MockDateTimePicker;
});

jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

describe('deleteFacture function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the facture and update the factures list on success', async () => {
    AsyncStorage.getItem.mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY');
    axios.delete.mockResolvedValue({ data: { success: true, message: 'Facture deleted successfully' } });

    await deleteFacture(4455, 14);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    expect(axios.delete).toHaveBeenCalledWith('http://192.168.1.123:3006/facture/fournisseur/4455/facture/14', {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY'
      },
    });
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Facture deleted successfully.');
  });

  it('should show an error message if the facture ID is incorrect', async () => {
    AsyncStorage.getItem.mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY');
    axios.delete.mockRejectedValue(new Error('Facture not found'));

    await deleteFacture(4455, 999); // Incorrect facture ID

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    expect(axios.delete).toHaveBeenCalledWith('http://192.168.1.123:3006/facture/fournisseur/4455/facture/999', {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY'
      },
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'An error occurred while deleting facture: Facture not found.');
  });

});
/*describe('handleSubmit function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a facture successfully', async () => {
    AsyncStorage.getItem.mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY');
    axios.post.mockResolvedValue({ data: { success: true, message: 'Facture added successfully' } });

    // Suppose you have a function to add a facture that takes the required data as arguments
    await handleSubmit('123456', 'Facture test', '2024-04-30', '1000', 'USD', 'Nature test', 'AUTRE', '2024-04-30', 'uploads/exemplefa.pdf');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    expect(axios.post).toHaveBeenCalledWith('http://192.168.0.5:3006/facture/save/4455', {
      num_fact: '123456',
      date_fact: '2024-04-30',
      montant: '1000',
      factname: 'Facture test',
      devise: 'USD',
      nature: 'Nature test',
      objet: 'AUTRE',
      datereception: '2024-04-30',
      pathpdf: 'uploads/exemplefa.pdf',
    }, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY'
      },
    });
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Facture added successfully.');
  });

  it('should show an error message if adding the facture fails', async () => {
    AsyncStorage.getItem.mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY');
    axios.post.mockRejectedValue(new Error('Failed to add facture'));

    // Suppose you have a function to add a facture that takes the required data as arguments
    await addFacture('123456', 'Facture test', '2024-04-30', '1000', 'USD', 'Nature test', 'AUTRE', '2024-04-30', 'uploads/exemplefa.pdf');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    expect(axios.post).toHaveBeenCalledWith('http://192.168.0.5:3006/facture/save/4455', {
      num_fact: '123456',
      date_fact: '2024-04-30',
      montant: '1000',
      factname: 'Facture test',
      devise: 'USD',
      nature: 'Nature test',
      objet: 'AUTRE',
      datereception: '2024-04-30',
      pathpdf: 'uploads/exemplefa.pdf',
    }, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJ1c2VyUHJvZmlsIjoiZm91cm5pc3NldXIiLCJpYXQiOjE3MTQ0NjczMzV9.lqbvUwkHhl7P_LmyiCVuIGzymqL7OKoK4cknlK_qvyY'
      },
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'An error occurred while adding facture: Failed to add facture.');
  });
});*/
