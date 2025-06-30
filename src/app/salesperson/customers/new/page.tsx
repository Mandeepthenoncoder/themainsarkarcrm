"use client";

import { useState, useTransition, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  createComprehensiveCustomerAction, 
  NewComprehensiveCustomerData, 
  CreateCustomerResult, 
  InterestCategoryItem, 
  InterestCategoryItemProduct 
} from '../actions'; // Updated action and interface
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Salesperson {
  id: string;
  full_name: string | null;
}

// --- Constants for Dropdowns (Replace with dynamic fetching if needed) ---
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

// Simplified Gold Categories based on your image - this would be more structured
const goldProductCategories = {
    "G.AD.RING": ["Casting CZ", "Itlian", "Machine", "MS"],
    "G.AD.EARRING": ["Casting CZ", "Itlian", "Machine", "MS"],
    "G.18 CHAIN": ["Rudrax PL", "Two tone", "White gold"],
    // ... Add ALL categories from your image here
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

const polkiProducts = ["Polki Necklace", "Polki Earrings", "Polki Set", "Polki Ring", "Polki Bangles"]; // Example
const polkiInternalCategories = ["Jadtar", "Traditional", "Fancy" ]; // Example from your description

const cuid = () => crypto.randomUUID();

const initialInterestCategoryItem: InterestCategoryItem = {
  id: cuid(),
  category_type: '',
  products: [],
  customer_preference_design_selected: false,
  customer_preference_wants_more_discount: false,
  customer_preference_checking_other_jewellers: false,
  customer_preference_felt_less_variety: false,
  customer_preference_others: '',
};

// Re-adding a minimal initialProductDetail to resolve reference errors
const initialProductDetail = {
  product_name: undefined as string | undefined,
  price_range: undefined as string | undefined,
  // Add other optional fields with default empty/null values if needed by addProductToInterestCategory
  gold_internal_categories: [],
  polki_categories: [],
  // diamond fields if necessary
};

const initialFormData: NewComprehensiveCustomerData = {
  full_name: '',
  phone_number: '',
  email: '',
  birth_date: '',
  anniversary_date: '',
  address_street: '',
  address_city: '',
  address_state: undefined,
  address_country: 'India',
  catchment_area: '',
  community: undefined,
  mother_tongue: '',
  reason_for_visit: undefined,
  lead_source: undefined,
  age_of_end_user: undefined,
  interest_level: 'Not Assessed',
  interest_categories: [JSON.parse(JSON.stringify(initialInterestCategoryItem))],
  customer_preference_design_selected: false,
  customer_preference_wants_more_discount: false,
  customer_preference_checking_other_jewellers: false,
  customer_preference_felt_less_variety: false,
  customer_preference_others: '',
  follow_up_date: '',
  summary_notes: '',
  assigned_salesperson_id: '',
  monthly_saving_scheme_status: undefined,
};

export default function AddComprehensiveCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [formData, setFormData] = useState<NewComprehensiveCustomerData>(initialFormData);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchSalespersons = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'salesperson');

      if (error) {
        console.error('Error fetching salespersons:', error);
      } else {
        setSalespersons(data as Salesperson[]);
      }
    };

    fetchSalespersons();
  }, [supabase]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev: NewComprehensiveCustomerData) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name: keyof NewComprehensiveCustomerData, value: string) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({ ...prev, [name]: value }));
  };

  // --- Interest Category Handlers ---
  const addInterestCategory = () => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
      ...prev,
      interest_categories: [...prev.interest_categories, { ...JSON.parse(JSON.stringify(initialInterestCategoryItem)), id: cuid() }]
    }));
  };

  const removeInterestCategory = (id: string) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
      ...prev,
      interest_categories: prev.interest_categories.filter((item: InterestCategoryItem) => item.id !== id)
    }));
  };

  const handleInterestCategoryChange = (id: string, field: keyof InterestCategoryItem, value: any) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
      ...prev,
      interest_categories: prev.interest_categories.map((item: InterestCategoryItem) =>
        item.id === id ? { ...item, [field]: value, products: field === 'category_type' ? [] : item.products } : item // Reset products if category_type changes
      )
    }));
  };
  
  const addProductToInterestCategory = (interestId: string) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
        ...prev,
        interest_categories: prev.interest_categories.map((interest: InterestCategoryItem) => 
            interest.id === interestId 
            ? { ...interest, products: [...interest.products, { ...JSON.parse(JSON.stringify(initialProductDetail)), id: cuid() }] } 
            : interest
        )
    }));
  };

  const removeProductFromInterestCategory = (interestId: string, productIndex: number) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
        ...prev,
        interest_categories: prev.interest_categories.map((interest: InterestCategoryItem) =>
            interest.id === interestId
            ? { ...interest, products: interest.products.filter((_: InterestCategoryItemProduct, idx: number) => idx !== productIndex) }
            : interest
        )
    }));
  };

  const handleProductDetailChange = (interestId: string, productIndex: number, field: string, value: any) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
        ...prev,
        interest_categories: prev.interest_categories.map((interest: InterestCategoryItem) =>
            interest.id === interestId
            ? { 
                ...interest, 
                products: interest.products.map((p: InterestCategoryItemProduct, idx: number) => 
                    idx === productIndex ? { ...p, [field]: value } : p
                )
              }
            : interest
        )
    }));
  };

  const handleInterestPreferenceChange = (id: string, field: keyof InterestCategoryItem, value: any) => {
    setFormData((prev: NewComprehensiveCustomerData) => ({
        ...prev,
        interest_categories: prev.interest_categories.map((item: InterestCategoryItem) =>
            item.id === id ? { ...item, [field]: value } : item
        )
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    console.log("Form Data Submitted:", JSON.stringify(formData, null, 2));

    // Basic client-side validation example
    if (!formData.full_name || !formData.phone_number) {
        setError("Full Name and Phone Number are required.");
        return;
    }
    if (formData.interest_categories.some((ic: InterestCategoryItem) => !ic.category_type)) {
        setError("Please select a category type for all interest categories.");
        return;
    }
    formData.interest_categories.forEach((ic: InterestCategoryItem, index: number) => {
        if(ic.products.some((p: InterestCategoryItemProduct) => !p.product_name || !p.price_range)){
            setError(`For Interest Category ${index+1}, all products must have a name and price range.`);
            return;
        }
    });
    if(error) return; // Stop if validation above set an error

    startTransition(async () => {
      const result: CreateCustomerResult = await createComprehensiveCustomerAction(formData);
      if (result.success && result.customerId) {
        setSuccess("Customer created successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/salesperson/customers`); // Or to `/salesperson/customers/${result.customerId}`
        }, 2000);
      } else {
        setError(result.error || "An unexpected error occurred.");
      }
    });
  };

  // Helper to get product options based on main interest category
  const getProductOptionsForInterestCategory = (categoryType: string) => {
    if (categoryType === 'Diamond') return diamondProducts;
    if (categoryType === 'Gold') return Object.keys(goldProductCategories);
    if (categoryType === 'Polki') return polkiProducts;
    return [];
  };

  const getInternalCategoriesForProduct = (categoryType: string, productName: string) => {
    if (categoryType === 'Diamond') return diamondInternalCategories;
    if (categoryType === 'Gold') return goldProductCategories[productName as keyof typeof goldProductCategories] || [];
    if (categoryType === 'Polki') return polkiInternalCategories;
    return [];
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Customer / Visit Log</CardTitle>
          <CardDescription>Enter details for the new customer and their visit.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" /> <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-100 border-green-400 text-green-700">
                <Terminal className="h-4 w-4" /> <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

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
                <div className="space-y-1">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g., Priya Sharma" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone_number">Phone Number (India) *</Label>
                  <Input id="phone_number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="+91 98XXXXXX00" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="e.g., priya.sharma@example.com" />
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

            {/* Section 2: Address */}
            <section className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
              <div className="space-y-1">
                <Label htmlFor="address_street">Street Address</Label>
                <Input id="address_street" name="address_street" value={formData.address_street || ''} onChange={handleChange} placeholder="e.g., 123, Diamond Lane" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="address_city">City</Label>
                  {/* TODO: Replace with a searchable dropdown for Indian cities */}
                  <Input id="address_city" name="address_city" value={formData.address_city || ''} onChange={handleChange} placeholder="e.g., Mumbai" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address_state">State</Label>
                  <Select name="address_state" value={formData.address_state || ''} onValueChange={(val) => handleSelectChange('address_state', val)}>
                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                      {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="address_country">Country</Label>
                  <Input id="address_country" name="address_country" value={formData.address_country || 'India'} onChange={handleChange} disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="catchment_area">Catchment Area</Label>
                  <Input id="catchment_area" name="catchment_area" value={formData.catchment_area || ''} onChange={handleChange} placeholder="e.g., South Mumbai, Bandra West" />
                </div>
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
                </div>
            </section>

            {/* Section 4: Interest Categories (Repeatable) */}
            <section className="space-y-4 p-4 border rounded-md">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-semibold">Customer Interests</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addInterestCategory}><PlusCircle className="mr-2 h-4 w-4"/>Add Interest</Button>
                </div>
                {formData.interest_categories.map((interestItem: InterestCategoryItem, interestIndex: number) => (
                    <div key={interestItem.id} className="space-y-3 p-3 border rounded-md bg-muted/20 relative">
                        <div className="flex justify-between items-center">
                             <p className="font-medium text-sm">Interest Item #{interestIndex + 1}</p>
                            {formData.interest_categories.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeInterestCategory(interestItem.id)} className="text-destructive hover:text-destructive/80 absolute top-1 right-1 h-7 w-7">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor={`interest_category_type_${interestItem.id}`}>Main Category *</Label>
                            <Select 
                                value={interestItem.category_type || ''}
                                onValueChange={(val) => handleInterestCategoryChange(interestItem.id, 'category_type', val as 'Diamond' | 'Gold' | 'Polki' | '')}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Main Category" /></SelectTrigger>
                                <SelectContent>
                                    {mainInterestCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {interestItem.category_type && (
                            <div className="pl-4 border-l-2 border-primary/50 space-y-3 pt-2">
                                {interestItem.products.map((product: InterestCategoryItemProduct, productIdx: number) => (
                                    <div key={productIdx} className="space-y-2 p-2 border rounded bg-background relative">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-medium text-muted-foreground">Product Entry #{productIdx + 1}</p>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProductFromInterestCategory(interestItem.id, productIdx)} className="text-destructive hover:text-destructive/80 absolute top-0 right-0 h-6 w-6">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor={`product_name_${interestItem.id}_${productIdx}`}>Product *</Label>
                                                <Select 
                                                    value={product.product_name || ''}
                                                    onValueChange={(val) => handleProductDetailChange(interestItem.id, productIdx, 'product_name', val)}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                                    <SelectContent>
                                                        {getProductOptionsForInterestCategory(interestItem.category_type).map(pName => <SelectItem key={pName} value={pName}>{pName}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor={`price_range_${interestItem.id}_${productIdx}`}>Price Range *</Label>
                                                <Select 
                                                    value={product.price_range || ''}
                                                    onValueChange={(val) => handleProductDetailChange(interestItem.id, productIdx, 'price_range', val)}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select Price Range" /></SelectTrigger>
                                                    <SelectContent>
                                                        {priceRanges.map(pr => <SelectItem key={pr} value={pr}>{pr}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {/* Conditional Internal Categories based on Product Name */}
                                        {product.product_name && (
                                            <> 
                                            {(interestItem.category_type === 'Diamond' || interestItem.category_type === 'Polki' || (interestItem.category_type === 'Gold' && getInternalCategoriesForProduct(interestItem.category_type, product.product_name).length > 0)) && (
                                                 <div className="space-y-1 pt-2">
                                                    <Label className="text-xs text-muted-foreground">Internal Categories for {product.product_name}</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getInternalCategoriesForProduct(interestItem.category_type, product.product_name).map((internalCat: string) => (
                                                            <Button 
                                                                type="button" 
                                                                key={internalCat} 
                                                                variant={ (interestItem.category_type === 'Diamond' && (product as any)[`diamond_${internalCat.toLowerCase().replace(/\s/g, '_')}`]) || 
                                                                          (interestItem.category_type === 'Gold' && product.gold_internal_categories?.includes(internalCat)) || 
                                                                          (interestItem.category_type === 'Polki' && product.polki_categories?.includes(internalCat)) 
                                                                          ? "default" : "outline"} 
                                                                size="sm"
                                                                onClick={() => {
                                                                    let currentVal;
                                                                    let fieldName: string;
                                                                    if (interestItem.category_type === 'Diamond') {
                                                                        fieldName = `diamond_${internalCat.toLowerCase().replace(/\s/g, '_')}`;
                                                                        currentVal = (product as any)[fieldName];
                                                                        handleProductDetailChange(interestItem.id, productIdx, fieldName, !currentVal);
                                                                    } else if (interestItem.category_type === 'Gold') {
                                                                        fieldName = 'gold_internal_categories';
                                                                        const currentGoldCats = product.gold_internal_categories || [];
                                                                        const newGoldCats = currentGoldCats.includes(internalCat) 
                                                                                            ? currentGoldCats.filter((c: string) => c !== internalCat) 
                                                                                            : [...currentGoldCats, internalCat];
                                                                        handleProductDetailChange(interestItem.id, productIdx, fieldName, newGoldCats);
                                                                    } else if (interestItem.category_type === 'Polki') {
                                                                        fieldName = 'polki_categories';
                                                                        const currentPolkiCats = product.polki_categories || [];
                                                                        const newPolkiCats = currentPolkiCats.includes(internalCat)
                                                                                             ? currentPolkiCats.filter((c: string) => c !== internalCat)
                                                                                             : [...currentPolkiCats, internalCat];
                                                                        handleProductDetailChange(interestItem.id, productIdx, fieldName, newPolkiCats);
                                                                    }
                                                                }}
                                                            >
                                                                {internalCat}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            </>
                                        )}
                                    </div> 
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={() => addProductToInterestCategory(interestItem.id)} className="mt-2">
                                    <PlusCircle className="mr-2 h-3 w-3"/>Add Product to this Interest
                                </Button>
                            </div>
                        )}
                        {/* Section 5: Customer Preference */}
                        <div className="space-y-4 p-4 border rounded-md mt-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Customer Preference</h3>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id={`customer_preference_design_selected_${interestItem.id}`} name="customer_preference_design_selected" checked={interestItem.customer_preference_design_selected} onChange={(e) => handleInterestPreferenceChange(interestItem.id, 'customer_preference_design_selected', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <Label htmlFor={`customer_preference_design_selected_${interestItem.id}`}>Design Selected?</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id={`customer_preference_wants_more_discount_${interestItem.id}`} name="customer_preference_wants_more_discount" checked={interestItem.customer_preference_wants_more_discount} onChange={(e) => handleInterestPreferenceChange(interestItem.id, 'customer_preference_wants_more_discount', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <Label htmlFor={`customer_preference_wants_more_discount_${interestItem.id}`}>Wants More Discount</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id={`customer_preference_checking_other_jewellers_${interestItem.id}`} name="customer_preference_checking_other_jewellers" checked={interestItem.customer_preference_checking_other_jewellers} onChange={(e) => handleInterestPreferenceChange(interestItem.id, 'customer_preference_checking_other_jewellers', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <Label htmlFor={`customer_preference_checking_other_jewellers_${interestItem.id}`}>Checking Other Jewellers</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id={`customer_preference_felt_less_variety_${interestItem.id}`} name="customer_preference_felt_less_variety" checked={interestItem.customer_preference_felt_less_variety} onChange={(e) => handleInterestPreferenceChange(interestItem.id, 'customer_preference_felt_less_variety', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <Label htmlFor={`customer_preference_felt_less_variety_${interestItem.id}`}>Felt Less Variety</Label>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={`customer_preference_others_${interestItem.id}`}>Other Preferences (if any)</Label>
                                    <Input id={`customer_preference_others_${interestItem.id}`} name="customer_preference_others" value={interestItem.customer_preference_others || ''} onChange={(e) => handleInterestPreferenceChange(interestItem.id, 'customer_preference_others', e.target.value)} placeholder="e.g., Specific customization request" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
            
            {/* Section 6: Follow-up & Summary */}
            <section className="space-y-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold border-b pb-2">Follow-up & Summary</h3>
                <div className="space-y-1 md:w-1/2 pr-2">
                    <Label htmlFor="follow_up_date">Next Follow-up Date</Label>
                    <Input id="follow_up_date" name="follow_up_date" type="date" value={formData.follow_up_date || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="summary_notes">Summary Notes of Visit</Label>
                    <Textarea id="summary_notes" name="summary_notes" value={formData.summary_notes || ''} onChange={handleChange} placeholder="Key discussion points, items shown, next steps..." className="min-h-[100px]"/>
                </div>
            </section>

          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? 'Adding Customer & Visit Log...' : 'Add Customer & Visit Log'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 