
import { X } from 'lucide-react';
import { useState } from 'react';
import { API_BASE_URL } from '@/config';

function AddTruckModal({ onClose }) {
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    capacity: '',
    year: '',
    status: 'Okay to Use',
    or_document: null,
    or_expiry_date: '',
    cr_document: null,
    cr_expiry_date: '',
    image: null,
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (name === 'image') {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
          alert('Only JPG, PNG, and GIF images are allowed.');
          e.target.value = null;
          return;
        }
      } else if (name === 'or_document' || name === 'cr_document') {
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(file.type)) {
          alert('Only PDF, DOC, DOCX, JPG, and PNG files are allowed for documents.');
          e.target.value = null;
          return;
        }
      }
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
        if (name === 'capacity') {
            if (value < 0) {
                alert('Capacity cannot be negative.');
                e.target.value = '';
                return;
            }
        }
        if (name === 'year') {
            if (value.length > 4) {
                alert('Year cannot be more than 4 digits.');
                e.target.value = value.slice(0, 4);
                return;
            }
        }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add_truck.php`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Truck added successfully!');
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while adding the truck.');
    }
  };

  return (
    <div className="fixed inset-0 bg-modal-background flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add Truck</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700">Plate Number</label>
              <input type="text" id="plate_number" name="plate_number" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <input type="text" id="model" name="model" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity (in tons)</label>
              <input type="number" id="capacity" name="capacity" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required step="0.01" />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
              <input type="number" id="year" name="year" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                <option>Okay to Use</option>
                <option>Not Okay to Use</option>
              </select>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Truck Photo</label>
              <input type="file" id="image" name="image" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" required accept="image/jpeg,image/png,image/gif" />
            </div>
            <div>
              <label htmlFor="or_document" className="block text-sm font-medium text-gray-700">OR Document</label>
              <input type="file" id="or_document" name="or_document" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" required accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" />
              <label htmlFor="or_expiry_date" className="block text-sm font-medium text-gray-700 mt-2">OR Expiry Date</label>
              <input type="date" id="or_expiry_date" name="or_expiry_date" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="cr_document" className="block text-sm font-medium text-gray-700">CR Document</label>
              <input type="file" id="cr_document" name="cr_document" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" required accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" />
              <label htmlFor="cr_expiry_date" className="block text-sm font-medium text-gray-700 mt-2">CR Expiry Date</label>
              <input type="date" id="cr_expiry_date" name="cr_expiry_date" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
             <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea id="remarks" name="remarks" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" style={{ resize: 'none' }} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={onClose} className="mr-2 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm">Cancel</button>
            <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm">Add Truck</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTruckModal;
