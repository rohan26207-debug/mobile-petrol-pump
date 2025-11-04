import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  ArrowRightLeft,
  Plus, 
  Edit,
  Trash2,
  IndianRupee
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import localStorageService from '../services/localStorage';

const Settlement = ({ 
  isDarkMode, 
  settlementData, 
  addSettlementRecord, 
  updateSettlementRecord, 
  deleteSettlementRecord, 
  selectedDate,
  formResetKey,
  editingRecord,
  onRecordSaved,
  hideRecordsList,
  customers
}) => {
  const [formData, setFormData] = useState({
    date: selectedDate,
    amount: '',
    description: '',
    mpp: false
  });
  
  // Check if MPP checkbox should be visible based on customers
  const isMPPVisible = React.useMemo(() => {
    return customers && customers.some(c => c.isMPP === true);
  }, [customers]);

  const [editingId, setEditingId] = useState(null);
  const [settlementTypes, setSettlementTypes] = useState([]);
  const { toast } = useToast();

  // Load settlement types on mount
  useEffect(() => {
    setSettlementTypes(localStorageService.getSettlementTypes());
  }, []);

  // Pre-fill form when editingRecord is provided
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        date: editingRecord.date,
        amount: editingRecord.amount.toString(),
        description: editingRecord.description
      });
      setEditingId(editingRecord.id);
    }
  }, [editingRecord]);

  // Reset form when formResetKey changes
  useEffect(() => {
    if (formResetKey) {
      resetForm();
    }
  }, [formResetKey]);

  // Update date when selectedDate changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      amount: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleSubmit = (shouldClose = false) => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateSettlementRecord(editingId, formData);
      toast({
        title: "Settlement Updated",
        description: "Settlement record has been updated successfully",
      });
    } else {
      addSettlementRecord(formData);
      toast({
        title: "Settlement Added",
        description: "Settlement record has been added successfully",
      });
    }

    resetForm();
    
    if (shouldClose && onRecordSaved) {
      onRecordSaved();
    }
  };

  const handleEdit = (record) => {
    setFormData({
      date: record.date,
      amount: record.amount.toString(),
      description: record.description
    });
    setEditingId(record.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this settlement record?')) {
      deleteSettlementRecord(id);
      toast({
        title: "Settlement Deleted",
        description: "Settlement record has been removed",
      });
    }
  };

  // Filter settlements for selected date
  const filteredSettlements = settlementData.filter(item => item.date === selectedDate);
  const totalSettlements = filteredSettlements.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          <ArrowRightLeft className="w-5 h-5 text-orange-600" />
          Settlement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entry Form */}
        <div className="space-y-3">
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {editingId ? 'Edit Settlement' : 'Add Settlement'}
          </h3>
          
          {/* Main Entry Row */}
          <div className={`p-0.5 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
            <div className="grid grid-cols-12 gap-0.5 items-start">
              {/* Description - 7 cols */}
              <div className="col-span-7">
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Select or enter settlement type..."
                  className={`text-sm ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}`}
                  list="settlement-types"
                  autoComplete="off"
                />
                <datalist id="settlement-types">
                  {settlementTypes.map((type) => (
                    <option key={type.id} value={type.name} />
                  ))}
                </datalist>
              </div>

              {/* Amount - 5 cols */}
              <div className="col-span-5">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className={`text-sm font-medium ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editingId ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!formData.amount || !formData.description}
              >
                <Plus className="w-4 h-4 mr-1" />
                Update Settlement
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={() => handleSubmit(false)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!formData.amount || !formData.description}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Settlement & Add More
              </Button>
              <Button 
                onClick={() => handleSubmit(true)}
                className="w-full bg-orange-700 hover:bg-orange-800 text-white"
                disabled={!formData.amount || !formData.description}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Settlement & Close
              </Button>
            </div>
          )}
        </div>

        {!hideRecordsList && (
          <>
            <Separator />

            {/* Records List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Today's Settlements
                </h3>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Total: ₹{totalSettlements.toFixed(2)}
                </Badge>
              </div>

              {filteredSettlements.length === 0 ? (
                <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  No settlement records for {new Date(selectedDate).toLocaleDateString()}
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredSettlements.map((record) => (
                      <div 
                        key={record.id}
                        className={`border rounded-lg p-3 ${
                          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}>
                                {record.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-lg font-semibold text-orange-600">
                              <IndianRupee className="w-4 h-4" />
                              {record.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Settlement;
