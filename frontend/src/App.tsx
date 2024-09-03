import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from '@mui/material';
import DataTable from 'react-data-table-component';
import { useForm, Controller } from 'react-hook-form';

type CapitalGain = {
  date: bigint;
  amount: number;
};

type TaxPayer = {
  tid: bigint;
  firstName: string;
  lastName: string;
  address: string;
  capitalGains: CapitalGain[];
};

const App: React.FC = () => {
  const [taxPayers, setTaxPayers] = useState<TaxPayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTID, setSearchTID] = useState('');
  const [searchError, setSearchError] = useState('');
  const [editingTaxPayer, setEditingTaxPayer] = useState<TaxPayer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCapitalGainDialogOpen, setIsCapitalGainDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { control: taxPayerControl, handleSubmit: handleTaxPayerSubmit, reset: resetTaxPayerForm } = useForm<Omit<TaxPayer, 'tid' | 'capitalGains'>>();
  const { control: capitalGainControl, handleSubmit: handleCapitalGainSubmit, reset: resetCapitalGainForm } = useForm<{ capitalGainDate: string; capitalGainAmount: number }>();

  const fetchTaxPayers = async () => {
    setLoading(true);
    try {
      const result = await backend.getAllTaxPayers();
      setTaxPayers(result);
    } catch (error) {
      console.error('Error fetching tax payers:', error);
      setSnackbarMessage('Error fetching tax payers');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxPayers();
  }, []);

  const onSubmitTaxPayer = async (data: Omit<TaxPayer, 'tid' | 'capitalGains'>) => {
    setLoading(true);
    try {
      const result = await backend.createTaxPayer(data.firstName, data.lastName, data.address);
      if ('ok' in result) {
        await fetchTaxPayers();
        resetTaxPayerForm();
        setSnackbarMessage('TaxPayer created successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Error creating tax payer:', result.err);
        setSnackbarMessage('Error creating tax payer');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error creating tax payer:', error);
      setSnackbarMessage('Error creating tax payer');
      setSnackbarOpen(true);
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
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Omit<TaxPayer, 'tid' | 'capitalGains'>) => {
    if (!editingTaxPayer) return;
    setLoading(true);
    try {
      const result = await backend.updateTaxPayer(editingTaxPayer.tid, data.firstName, data.lastName, data.address);
      if ('ok' in result) {
        await fetchTaxPayers();
        setIsEditDialogOpen(false);
        setSnackbarMessage('TaxPayer updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Error updating tax payer:', result.err);
        setSnackbarMessage('Error updating tax payer');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating tax payer:', error);
      setSnackbarMessage('Error updating tax payer');
      setSnackbarOpen(true);
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
          setSnackbarMessage('TaxPayer deleted successfully');
          setSnackbarOpen(true);
        } else {
          console.error('Error deleting tax payer:', result.err);
          setSnackbarMessage('Error deleting tax payer');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error deleting tax payer:', error);
        setSnackbarMessage('Error deleting tax payer');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddCapitalGain = (taxPayer: TaxPayer) => {
    setEditingTaxPayer(taxPayer);
    resetCapitalGainForm();
    setIsCapitalGainDialogOpen(true);
  };

  const onSubmitCapitalGain = async (data: { capitalGainDate: string; capitalGainAmount: number }) => {
    if (!editingTaxPayer) return;
    setLoading(true);
    try {
      const result = await backend.addCapitalGain(
        editingTaxPayer.tid,
        BigInt(new Date(data.capitalGainDate).getTime() * 1000000), // Convert to nanoseconds
        data.capitalGainAmount
      );
      if ('ok' in result) {
        await fetchTaxPayers();
        setIsCapitalGainDialogOpen(false);
        setSnackbarMessage('Capital gain added successfully');
        setSnackbarOpen(true);
      } else {
        console.error('Error adding capital gain:', result.err);
        setSnackbarMessage('Error adding capital gain');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error adding capital gain:', error);
      setSnackbarMessage('Error adding capital gain');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: 'TID', selector: (row: TaxPayer) => Number(row.tid), sortable: true },
    { name: 'First Name', selector: (row: TaxPayer) => row.firstName, sortable: true },
    { name: 'Last Name', selector: (row: TaxPayer) => row.lastName, sortable: true },
    { name: 'Address', selector: (row: TaxPayer) => row.address, sortable: true },
    { name: 'Capital Gains', selector: (row: TaxPayer) => row.capitalGains.length, sortable: true },
    {
      name: 'Actions',
      cell: (row: TaxPayer) => (
        <>
          <Button onClick={() => handleEdit(row)} color="primary" size="small">Edit</Button>
          <Button onClick={() => handleDelete(row.tid)} color="secondary" size="small">Delete</Button>
          <Button onClick={() => handleAddCapitalGain(row)} color="info" size="small">Add Capital Gain</Button>
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
            <form onSubmit={handleTaxPayerSubmit(onSubmitTaxPayer)}>
              <Controller
                name="firstName"
                control={taxPayerControl}
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
                control={taxPayerControl}
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
                control={taxPayerControl}
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
          <form onSubmit={handleTaxPayerSubmit(handleUpdate)}>
            <Controller
              name="firstName"
              control={taxPayerControl}
              defaultValue={editingTaxPayer?.firstName || ''}
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
              control={taxPayerControl}
              defaultValue={editingTaxPayer?.lastName || ''}
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
              control={taxPayerControl}
              defaultValue={editingTaxPayer?.address || ''}
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
          <Button onClick={handleTaxPayerSubmit(handleUpdate)} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isCapitalGainDialogOpen} onClose={() => setIsCapitalGainDialogOpen(false)}>
        <DialogTitle>Add Capital Gain</DialogTitle>
        <DialogContent>
          <form onSubmit={handleCapitalGainSubmit(onSubmitCapitalGain)}>
            <Controller
              name="capitalGainDate"
              control={capitalGainControl}
              defaultValue=""
              rules={{ required: 'Date is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="capitalGainAmount"
              control={capitalGainControl}
              defaultValue={0}
              rules={{ required: 'Amount is required', min: { value: 0, message: 'Amount must be positive' } }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
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
          <Button onClick={() => setIsCapitalGainDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCapitalGainSubmit(onSubmitCapitalGain)} color="primary">
            Add Capital Gain
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default App;
