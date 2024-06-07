import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import { Alert } from 'react-native';
import ReclamationForm from '../pages/reclamation';

jest.mock('axios');

describe('handleSubmit', () => {
  it('should send reclamation when form is submitted', async () => {
    const { getByPlaceholderText, getByText } = render(<ReclamationForm />);
    const input = getByPlaceholderText('Contenu de la réclamation');
    const sendButton = getByText('Envoyer');

    fireEvent.changeText(input, 'Contenu de test');
    fireEvent.press(sendButton);

    // Mocking the axios post request
    axios.post.mockResolvedValueOnce({ data: 'Reclamation envoyée avec succès' });

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    // Vérifiez que le message d'alerte est affiché après le succès de l'envoi
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Réclamation envoyée avec succès');

    // Vérifiez que le formulaire est réinitialisé après l'envoi réussi
    // Assuming your component properly resets the input value on successful submission
    expect(input.props.value).toBe('');
  });
});
