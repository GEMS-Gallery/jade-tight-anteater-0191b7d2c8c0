import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Box, TextField, Button, CircularProgress } from '@mui/material';
import DataTable from 'react-data-table-component';
import { useForm, Controller } from 'react-hook-form';

type TaxPayer = {
  tid: bigint;
  firstName: string;
  lastName: string;
  address: string;
};

const App: React.FC = () => {
  const [taxPayers, setTaxPayers] = useState<TaxPayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTID, setSearchTID] = useState('');
  const { control, handleSubmit, reset } = useForm<Omit<TaxPayer, 'tid'>>();

  const fetchTaxPayers = async () => {
    setLoading(true);
    try {
      const result = await backend.getAllTaxPayers();
      setTaxPayers(result);
    } catch (error) {
      console.error('Error fetching tax payers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxPayers();
  }, []);

  const onSubmit = async (data: Omit<TaxPayer, 'tid'>) => {
    setLoading(true);
    try {
      const result = await backend.createTaxPayer(data.firstName, data.lastName, data.address);
      if ('ok' in result) {
        await fetchTaxPayers();
        reset();
      } else {
        console.error('Error creating tax payer:', result.err);
      }
    } catch (error) {
      console.error('Error creating tax payer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTID) return;
    setLoading(true);
    try {
      const result = await backend.searchTaxPayerByTID(BigInt(searchTID));
      if (result) {
        setTaxPayers([result]);
      } else {
        setTaxPayers([]);
      }
    } catch (error) {
      console.error('Error searching tax payer:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: 'TID', selector: (row: TaxPayer) => Number(row.tid), sortable: true },
    { name: 'First Name', selector: (row: TaxPayer) => row.firstName, sortable: true },
    { name: 'Last Name', selector: (row: TaxPayer) => row.lastName, sortable: true },
    { name: 'Address', selector: (row: TaxPayer) => row.address, sortable: true },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          TaxPayer Management System
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ width: '45%' }}>
            <Typography variant="h6" gutterBottom>
              Add New TaxPayer
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="firstName"
                control={control}
                defaultValue=""
                rules={{ required: 'First name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    margin="normal"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                defaultValue=""
                rules={{ required: 'Last name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={control}
                defaultValue=""
                rules={{ required: 'Address is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    margin="normal"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Add TaxPayer'}
              </Button>
            </form>
          </Box>
          <Box sx={{ width: '45%' }}>
            <Typography variant="h6" gutterBottom>
              Search TaxPayer
            </Typography>
            <TextField
              label="Search by TID"
              fullWidth
              margin="normal"
              value={searchTID}
              onChange={(e) => setSearchTID(e.target.value)}
            />
            <Button onClick={handleSearch} variant="contained" color="secondary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>
        </Box>
        <DataTable
          title="TaxPayer Records"
          columns={columns}
          data={taxPayers}
          pagination
          progressPending={loading}
          progressComponent={<CircularProgress />}
        />
      </Box>
    </Container>
  );
};

export default App;
