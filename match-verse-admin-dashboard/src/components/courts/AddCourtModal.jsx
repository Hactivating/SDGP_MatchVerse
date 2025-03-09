import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const AddCourtModal = ({ isOpen, onClose, onAdd, venueId }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venueId) {
      alert('Cannot add court: You must be logged in.');
      return;
    }
    if (!formData.name.trim()) {
      alert('Please enter a court name');
      return;
    }

    setLoading(true);
    try {
      // Create court data with venueId included
      const courtData = {
        name: formData.name,
        venueId: parseInt(venueId, 10) // Include venueId and ensure it's a number
      };
      
      await onAdd(courtData);
      // Reset form
      setFormData({ name: '' });
    } catch (error) {
      console.error('Error adding court:', error);
      alert('Failed to create court: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Court"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-court-form"
            disabled={loading || !venueId}
          >
            {loading ? 'Adding...' : 'Add Court'}
          </Button>
        </>
      }
    >
      <form id="add-court-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
  Court Name
</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="input w-full"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Court 1, Main Tennis Court, etc."
            />
          </div>
          <div className="pt-2">
            <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-600">
              <p>This court will be created for your venue (Venue ID: {venueId}).</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddCourtModal;