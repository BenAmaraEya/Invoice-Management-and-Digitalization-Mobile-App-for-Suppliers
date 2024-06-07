import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Form, FormGroup, Label, Input, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import '../../styles/Archive.css'; 

const ArchiveViewer = () => {
  const [archives, setArchives] = useState([]);
  const [filteredArchives, setFilteredArchives] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const response = await axios.get('http://localhost:3006/archive');
      setArchives(response.data);
      setFilteredArchives(response.data); 
      const availableYears = response.data.map((archive) => archive.annee);
      setYears(Array.from(new Set(availableYears))); 
    } catch (error) {
      console.error('Erreur de récuperation de l\'archive:', error);
    }
  };

  const handleYearFilter = async () => {
    if (!selectedYear) {
      setFilteredArchives(archives);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3006/archive/listArchive/${selectedYear}`);
      const filteredData = response.data?.Factures ? [response.data] : [];
      setFilteredArchives(filteredData);
    } catch (error) {
      console.error('Erreur de recuperation de l\'archive filté:', error);
    }
  };

  return (
    <Container className="archive-viewer-container">
      <Table bordered hover responsive>
        <thead>
          <tr className='filter-archive'>
            <th colSpan='3'>
              <Form inline className="filter-form">
                <FormGroup className="form-group">
                  <Label for="yearFilter" className="mr-2" style={{color:'#3b1b0d'}}>Filter par année:</Label>
                  <Input
                    type="select"
                    id="yearFilter"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="mr-2"
                  >
                    <option value="">Tous</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Input>
                  <Button onClick={handleYearFilter} style={{marginTop:'20px',marginRight:'20px'}}>Filter</Button>
                </FormGroup>
              </Form>
            </th>
          </tr>
          <tr className='header-row-archive'>
            <th>ID</th>
            <th>Année</th>
            <th>Factures</th>
          </tr>
        </thead>
        <tbody>
          {filteredArchives && filteredArchives.length > 0 ? (
            filteredArchives.map((archive) => (
              <tr key={archive.id}>
                <td>{archive.id}</td>
                <td>{archive.annee}</td>
                <td>
                  {Array.isArray(archive.Factures) && archive.Factures.length > 0 ? (
                    <div className="facture-list">
                      {archive.Factures.map((facture) => (
                        <div key={facture.idF} className="facture-item">
                          <p><strong>Facture Numéro:</strong> {facture.num_fact}</p>
                          <p><strong>Date:</strong> {facture.date_fact}</p>
                          <p><strong>iderp Fournisseur:</strong> {facture.iderp}</p>
                          <Link to={`/detailsFacture/${facture.idF}`}>
                            <Button className="details-button" size="sm">Details</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>pas de factures.</p>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">pas d'archive.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ArchiveViewer;
