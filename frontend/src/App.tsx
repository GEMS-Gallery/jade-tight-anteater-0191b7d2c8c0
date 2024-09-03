import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  const [searchError, setSearchError] = useState('');
  const [editingTaxPayer, setEditingTaxPayer] = useState<TaxPayer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { control, handleSubmit, reset, setValue } = useForm<Omit<TaxPayer, 'tid'>>();

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
    setSearchError('');
    try {
      const tidNumber = Number(searchTID);
      if (isNaN(tidNumber)) {
        setSearchError('Invalid TID. Please enter a valid number.');
        return;
      }
      const result = await backend.searchTaxPayerByTID(BigInt(tidNumber));
      if (result.length > 0) {
        setTaxPayers(result);
      } else {
        setTaxPayers([]);
        setSearchError('No matching records found.');
      }
    } catch (error) {
      console.error('Error searching tax payer:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (taxPayer: TaxPayer) => {
    setEditingTaxPayer(taxPayer);
    setValue('firstName', taxPayer.firstName);
    setValue('lastName', taxPayer.lastName);
    setValue('address', taxPayer.address);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Omit<TaxPayer, 'tid'>) => {
    if (!editingTaxPayer) return;
    setLoading(true);
    try {
      const result = await backend.updateTaxPayer(editingTaxPayer.tid, data.firstName, data.lastName, data.address);
      if ('ok' in result) {
        await fetchTaxPayers();
        setIsEditDialogOpen(false);
      } else {
        console.error('Error updating tax payer:', result.err);
      }
    } catch (error) {
      console.error('Error updating tax payer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tid: bigint) => {
    if (window.confirm('Are you sure you want to delete this taxpayer?')) {
      setLoading(true);
      try {
        const result = await backend.deleteTaxPayer(tid);
        if ('ok' in result) {
          await fetchTaxPayers();
        } else {
          console.error('Error deleting tax payer:', result.err);
        }
      } catch (error) {
        console.error('Error deleting tax payer:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { name: 'TID', selector: (row: TaxPayer) => Number(row.tid), sortable: true },
    { name: 'First Name', selector: (row: TaxPayer) => row.firstName, sortable: true },
    { name: 'Last Name', selector: (row: TaxPayer) => row.lastName, sortable: true },
    { name: 'Address', selector: (row: TaxPayer) => row.address, sortable: true },
    {
      name: 'Actions',
      cell: (row: TaxPayer) => (
        <>
          <Button onClick={() => handleEdit(row)} color="primary" size="small">Edit</Button>
          <Button onClick={() => handleDelete(row.tid)} color="secondary" size="small">Delete</Button>
        </>
      ),
    },
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
            {searchError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {searchError}
              </Alert>
            )}
          </Box>
        </Box>
        <DataTable
          title="TaxPayer Records"
          columns={columns}
          data={taxPayers}
          pagination
          progressPending={loading}
          progressComponent={<CircularProgress />}
          noDataComponent={<Typography>No records found</Typography>}
        />
      </Box>
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit TaxPayer</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleUpdate)}>
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(handleUpdate)} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;
