"use client";

import { useState, useTransition, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  updateComprehensiveCustomerAction, 
  NewComprehensiveCustomerData, 
  CreateCustomerResult, 
  InterestCategoryItem, 
  InterestCategoryItemProduct 
} from '../../actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// --- Reusing types and constants ---
interface Salesperson {
  id: string;
  full_name: string | null;
}
const indianStates = [ "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir" ];
const communities = [ "Hindu", "Muslim", "Sikh", "Jain", "Christian", "Parsi", "Buddhist", "Other" ];
const reasonsForVisit = [ "Wedding", "Self-purchase", "Gifting", "Browse", "Repair", "Other" ];
const leadSources = [ "Social Media (Instagram/Facebook)", "Google Search", "Newspaper / Magazine Ad", "Radio Ad", "Referral (Friend or Family)", "Walk-in / Signage", "Other" ];
const ageOfEndUserOptions = [ "Under 18", "18-25", "26-35", "36-45", "46-55", "56-65", "65+", "All/Family" ];
const mainInterestCategories = ["Diamond", "Gold", "Polki"];
const priceRanges = ["0-25K", "25K-50K", "50K-75K", "75K-1L", "1L-2L", "2L-3L", "3L-5L", "5L-10L", "10L-20L", "20L-50L", "50L-1CR", ">1CR"];
const monthlySavingSchemeOptions = ["Joined", "Interested", "Not Interested"];

const diamondProducts = ["Diamond Rings", "Diamond Earrings", "Diamond Pendant Set", "Diamond Bracelet", "Diamond Pendant", "Diamond Set"];
const diamondInternalCategories = ["Color Stone", "Fancy", "Pressure Setting", "Solitaire", "Traditional"];

const goldProductCategories = {
    "G.AD.RING": ["Casting CZ", "Itlian", "Machine", "MS"],
    "G.AD.EARRING": ["Casting CZ", "Itlian", "Machine", "MS"],
    "G.18 CHAIN": ["Rudrax PL", "Two tone", "White gold"],
    "G.AD P.SET": ["Casting CZ"],
    "G.PENDENT": ["Handmade"],
    "G.BACCHA LUCKEY": ["Machine", "MS"],
    "G.LUCKEY": ["Rudrax PL", "Casting PL", "Handmade", "Itlian", "Machine", "MS", "Nawabi", "Rudrax PL", "Two tone", "Vertical hollow"],
    "G.MANGALSUTRA": ["Handmade", "Machine"],
    "G.CHAIN": ["Handmade", "Itlian", "Machine", "Nawabi", "Two tone", "Vertical hollow"],
    "G.AD PENDENT": ["Casting CZ"],
    "G.AD BRACLET": ["Casting CZ", "Casting PL", "Handmade", "MS"],
    "G.EARRINGS": ["Rudrax PL"],
    "G.RING": ["Handmade"],
    "G.BACCHA KADLI": ["Handmade"],
    "G.MALA": ["Handmade", "Hirakenthi", "Machine", "Rudrax PL", "Tulsi mala", "Vertical Solid"],
    "J.EARRINGS": ["Heritage", "Jadtar", "Semi jadtar", "Traditional", "Handmade"],
    "G.DOKIYU": ["Traditional"],
    "J.KANSER": ["Jadtar"],
    "G.BANGLES": ["Casting PL", "fancy"],
    "J.BRACLET": ["Heritage", "Jadtar", "Traditional"],
    "J.SET": ["Heritage", "Jadtar", "Semi jadtar", "Traditional"],
    "J.KADA": ["Heritage", "Jadtar", "Semi jadtar", "Traditional"],
    "G.PENDENT SET": ["Handmade"],
    "J.RING": ["Jadtar", "Traditional"],
    "G.AD BANGLES": ["Casting CZ", "Casting PL"],
    "G.KADLI": ["Copper"],
    "G.KADA": ["Handmade"],
    "14CT DI.VI.SET": [],
    "14CT DI.VI.BRACELET": [],
    "14CT DI.VI.EARRING": [],
};

const polkiProducts = ["Polki Necklace", "Polki Earrings", "Polki Set", "Polki Ring", "Polki Bangles"];
const polkiInternalCategories = ["Jadtar", "Traditional", "Fancy" ];

const cuid = () => crypto.randomUUID();

const initialProductDetail = {
  product_name: undefined as string | undefined,
  price_range: undefined as string | undefined,
  gold_internal_categories: [],
  polki_categories: [],
};

export default function EditComprehensiveCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.customerId as string;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<NewComprehensiveCustomerData>>({ interest_categories: [] });
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      const salespersonsPromise = supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'salesperson');

      const customerPromise = customerId 
        ? supabase.from('customers').select('*').eq('id', customerId).is('deleted_at', null).single()
        : Promise.resolve({ data: null, error: null });

      const [
        { data: salespersonsData, error: salespersonsError },
        { data: customerData, error: customerError }
      ] = await Promise.all([salespersonsPromise, customerPromise]);
      
      if (salespersonsError) {
        console.error('Error fetching salespersons:', salespersonsError);
        setError('Failed to load salespersons.');
      } else {
        setSalespersons(salespersonsData as Salesperson[] || []);
      }

      if (customerId) {
        if (customerError || !customerData) {
          setError('Failed to load customer data. The customer may not exist.');
          console.error(customerError);
        } else {
          setFormData({
            full_name: customerData.full_name || '',
            phone_number: customerData.phone_number || '',
            email: customerData.email || '',
            birth_date: customerData.birth_date,
            anniversary_date: customerData.anniversary_date,
            address_street: customerData.address_street || '',
            address_city: customerData.address_city || '',
            address_state: customerData.address_state || '',
            address_country: customerData.address_country || 'India',
            catchment_area: customerData.catchment_area || '',
            community: customerData.community || '',
            mother_tongue: customerData.mother_tongue || '',
            reason_for_visit: customerData.reason_for_visit || '',
            lead_source: customerData.lead_source || '',
            age_of_end_user: customerData.age_of_end_user || '',
            interest_level: customerData.interest_level || 'None',
            interest_categories: (customerData.interest_categories_json || []).map((i: any) => ({
              id: i.id || cuid(), // Ensure ID exists for key prop
              category_type: i.category_type,
              products: i.products || [],
              customer_preference_design_selected: i.customer_preferences?.design_selected || false,
              customer_preference_wants_more_discount: i.customer_preferences?.wants_more_discount || false,
              customer_preference_checking_other_jewellers: i.customer_preferences?.checking_other_jewellers || false,
              customer_preference_felt_less_variety: i.customer_preferences?.felt_less_variety || false,
              customer_preference_others: i.customer_preferences?.others || '',
            })),
            follow_up_date: customerData.follow_up_date,
            summary_notes: customerData.notes || '',
            assigned_salesperson_id: customerData.assigned_salesperson_id || '',
            monthly_saving_scheme_status: customerData.monthly_saving_scheme_status,
            purchase_amount: customerData.purchase_amount || undefined,
          });
        }
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [customerId, supabase]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof NewComprehensiveCustomerData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addInterestCategory = () => {
    setFormData((prev) => ({
      ...prev,
      interest_categories: [...(prev.interest_categories || []), { id: cuid(), category_type: '', products: [], customer_preference_design_selected: false, customer_preference_wants_more_discount: false, customer_preference_checking_other_jewellers: false, customer_preference_felt_less_variety: false, customer_preference_others: '' }]
    }));
  };

  const removeInterestCategory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interest_categories: prev.interest_categories?.filter((item) => item.id !== id)
    }));
  };

  const handleInterestCategoryChange = (id: string, field: keyof InterestCategoryItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      interest_categories: prev.interest_categories?.map((item) =>
        item.id === id ? { ...item, [field]: value, products: field === 'category_type' ? [] : item.products } : item
      )
    }));
  };
  
  const handleInterestPreferenceChange = (id: string, field: keyof InterestCategoryItem, value: any) => {
    setFormData((prev) => ({
        ...prev,
        interest_categories: prev.interest_categories?.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        )
    }));
  };

  const addProductToInterestCategory = (interestId: string) => {
    setFormData((prev) => ({
        ...prev,
        interest_categories: prev.interest_categories?.map((interest) => 
            interest.id === interestId 
            ? { ...interest, products: [...interest.products, { ...JSON.parse(JSON.stringify(initialProductDetail)), id: cuid() }] } 
            : interest
        )
    }));
  };

  const removeProductFromInterestCategory = (interestId: string, productIndex: number) => {
    setFormData((prev) => ({
        ...prev,
        interest_categories: prev.interest_categories?.map((interest) =>
            interest.id === interestId
            ? { ...interest, products: interest.products.filter((_, idx) => idx !== productIndex) }
            : interest
        )
    }));
  };

  const handleProductDetailChange = (interestId: string, productIndex: number, field: string, value: any) => {
    setFormData((prev) => ({
        ...prev,
        interest_categories: prev.interest_categories?.map((interest) =>
            interest.id === interestId
            ? { 
                ...interest, 
                products: interest.products.map((p, idx) => 
                    idx === productIndex ? { ...p, [field]: value } : p
                )
              }
            : interest
        )
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result: CreateCustomerResult = await updateComprehensiveCustomerAction(customerId, formData as NewComprehensiveCustomerData);
      if (result.success) {
        setSuccess("Customer updated successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/salesperson/customers/${customerId}`);
        }, 2000);
      } else {
        setError(result.error || "An unexpected error occurred.");
      }
    });
  };
  
  const getProductOptionsForInterestCategory = (categoryType: string | undefined) => {
    if (categoryType === 'Diamond') return diamondProducts;
    if (categoryType === 'Gold') return Object.keys(goldProductCategories);
    if (categoryType === 'Polki') return polkiProducts;
    return [];
  };

  const getInternalCategoriesForProduct = (categoryType: string | undefined, productName: string) => {
    if (categoryType === 'Diamond') return diamondInternalCategories;
    if (categoryType === 'Gold') return (goldProductCategories as any)[productName] || [];
    if (categoryType === 'Polki') return polkiInternalCategories;
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <svg className="mx-auto h-12 w-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
          <CardDescription>Update the details for {formData.full_name || 'this customer'}.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 py-6">
             {error && <Alert variant="destructive"><Terminal className="h-4 w-4" /> <AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
             {success && <Alert><Terminal className="h-4 w-4" /> <AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            {/* Section 1: Basic Info */}
            <section className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-semibold border-b pb-2">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <Label htmlFor="assigned_salesperson_id">Salesperson *</Label>
                      <Select name="assigned_salesperson_id" value={formData.assigned_salesperson_id} onValueChange={(val) => handleSelectChange('assigned_salesperson_id', val)} required>
                          <SelectTrigger><SelectValue placeholder="Select Salesperson" /></SelectTrigger>
                          <SelectContent>
                              {salespersons.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input id="phone_number" name="phone_number" type="tel" value={formData.phone_number || ''} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                  </div>
                <div className="space-y-1">
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1 md:w-1/2 pr-2">
                 <Label htmlFor="anniversary_date">Anniversary Date</Label>
                 <Input id="anniversary_date" name="anniversary_date" type="date" value={formData.anniversary_date || ''} onChange={handleChange} />
              </div>
            </section>
            
            {/* Section 3: Demographics & Visit Details */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold border-b pb-2">Demographics & Visit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="community">Community</Label>
                        <Select name="community" value={formData.community || ''} onValueChange={(val) => handleSelectChange('community', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Community" /></SelectTrigger>
                            <SelectContent>
                                {communities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="mother_tongue">Mother Tongue / Sub-community</Label>
                        <Input id="mother_tongue" name="mother_tongue" value={formData.mother_tongue || ''} onChange={handleChange} placeholder="e.g., Gujarati, Marwari Jain" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="reason_for_visit">Reason for Visit</Label>
                        <Select name="reason_for_visit" value={formData.reason_for_visit || ''} onValueChange={(val) => handleSelectChange('reason_for_visit', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Reason" /></SelectTrigger>
                            <SelectContent>
                                {reasonsForVisit.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="lead_source">Lead Source</Label>
                        <Select name="lead_source" value={formData.lead_source || ''} onValueChange={(val) => handleSelectChange('lead_source', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                            <SelectContent>
                                {leadSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="age_of_end_user">Age of End-User</Label>
                        <Select name="age_of_end_user" value={formData.age_of_end_user || ''} onValueChange={(val) => handleSelectChange('age_of_end_user', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Age Group" /></SelectTrigger>
                            <SelectContent>
                                {ageOfEndUserOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="interest_level">Initial Interest Level</Label>
                        <Select 
                            name="interest_level" 
                            value={formData.interest_level || 'None'} 
                            onValueChange={(val) => handleSelectChange('interest_level', val as 'Hot' | 'Warm' | 'Cold' | 'None')}
                        >
                            <SelectTrigger><SelectValue placeholder="Select interest level" /></SelectTrigger>
                            <SelectContent>
                                {['None', 'Cold', 'Warm', 'Hot'].map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                        <Label htmlFor="monthly_saving_scheme_status">Monthly Saving Scheme</Label>
                        <Select
                            name="monthly_saving_scheme_status"
                            value={formData.monthly_saving_scheme_status || ''}
                            onValueChange={(val) => handleSelectChange('monthly_saving_scheme_status', val as "Joined" | "Interested" | "Not Interested")}
                        >
                            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                            <SelectContent>
                                {monthlySavingSchemeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="purchase_amount">Purchase Amount (₹)</Label>
                        <Input 
                            id="purchase_amount" 
                            name="purchase_amount" 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={formData.purchase_amount || ''} 
                            onChange={handleChange} 
                            placeholder="e.g., 75000.00"
                        />
                        <p className="text-xs text-muted-foreground">Converted revenue if customer made a purchase</p>
                    </div>
                </div>
            </section>

          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" asChild>
              <Link href={`/salesperson/customers/${customerId}`}><ArrowLeft className="h-4 w-4 mr-2" /> Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating Customer...' : 'Update Customer'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 