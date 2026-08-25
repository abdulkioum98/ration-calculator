import React, { useState, ChangeEvent, FormEvent } from 'react';

export interface CowData {
  breed: string;
  age: string;
  weight: string;
  lactationNo: string;
  ageLactation: string;
  milkYield: string;
  nourishFeed: string;
}

interface CowInfoPageProps {
  onSaveAndNext: (data: CowData) => void;
}

export default function CowInfoPage({ onSaveAndNext }: CowInfoPageProps) {
  const [formData, setFormData] = useState<CowData>({
    breed: '',
    age: '',
    weight: '',
    lactationNo: '',
    ageLactation: '',
    milkYield: '',
    nourishFeed: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.milkYield) {
      alert('Please fill in Body Weight and Milk Yield!');
      return;
    }
    onSaveAndNext(formData);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-bold text-emerald-800 border-b pb-2">Information of Cow</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Breed Type</label>
          <select
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Breed</option>
            <option value="Holstein Friesian Cross">Holstein Friesian Cross</option>
            <option value="Sahiwal Cross">Sahiwal Cross</option>
            <option value="Local / Deshi">Local / Deshi</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Age of Cow (Month)</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="e.g. 36"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Present Body Weight (Kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g. 350"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Lactation No</label>
          <input
            type="number"
            name="lactationNo"
            value={formData.lactationNo}
            onChange={handleChange}
            placeholder="e.g. 2"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Age of Lactation (Month)</label>
          <input
            type="number"
            name="ageLactation"
            value={formData.ageLactation}
            onChange={handleChange}
            placeholder="e.g. 3"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Milk Yield Per Day (Litre)</label>
          <input
            type="number"
            step="0.1"
            name="milkYield"
            value={formData.milkYield}
            onChange={handleChange}
            placeholder="e.g. 12"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Name of Nourish Feed</label>
          <select
            name="nourishFeed"
            value={formData.nourishFeed}
            onChange={handleChange}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Nourish Feed</option>
            <option value="Nourish Dairy Feed Standard">Nourish Dairy Feed Standard</option>
            <option value="Nourish Dairy Feed Premium">Nourish Dairy Feed Premium</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow hover:bg-emerald-700 transition mt-2"
        >
          Save & Next
        </button>
      </form>
    </div>
  );
}