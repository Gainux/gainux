import { supabase } from "@/lib/supabase";
import type { Lead, Deal, Contact, Company, CRMActivity, Quote, LeadCategory, LeadLocation } from "../types";

// --- Helpers ---

const mapToLeadCategory = (data: any): LeadCategory => ({
    id: data.id,
    orgId: data.org_id,
    name: data.name,
    color: data.color ?? '#6366f1',
    createdAt: data.created_at,
});

const mapToLeadLocation = (data: any): LeadLocation => ({
    id: data.id,
    orgId: data.org_id,
    categoryId: data.category_id,
    name: data.name,
    createdAt: data.created_at,
});

const mapToLead = (data: any): Lead => ({
    id: data.id,
    orgId: data.org_id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    companyName: data.company_name,
    source: data.source,
    status: data.status,
    ownerId: data.owner_id,
    owner: data.employees ? {
        id: data.employees.id,
        firstName: data.employees.first_name,
        lastName: data.employees.last_name
    } : undefined,
    notes: data.notes,
    categoryId: data.category_id,
    category: data.lead_categories ? mapToLeadCategory(data.lead_categories) : undefined,
    locationId: data.location_id,
    location: data.lead_locations ? mapToLeadLocation(data.lead_locations) : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToCompany = (data: any): Company => ({
    id: data.id,
    orgId: data.org_id,
    name: data.name,
    industry: data.industry,
    website: data.website,
    phone: data.phone,
    email: data.email,
    address: data.address,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToContact = (data: any): Contact => ({
    id: data.id,
    orgId: data.org_id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    position: data.position,
    companyId: data.company_id,
    company: data.companies ? mapToCompany(data.companies) : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToDeal = (data: any): Deal => ({
    id: data.id,
    orgId: data.org_id,
    title: data.title,
    value: Number(data.value),
    currency: data.currency,
    stage: data.stage,
    probability: data.probability,
    quantity: Number(data.quantity || 1),
    expectedCloseDate: data.expected_close_date,
    leadId: data.lead_id,
    lead: data.leads ? mapToLead(data.leads) : undefined,
    companyId: data.company_id,
    company: data.companies ? mapToCompany(data.companies) : undefined,
    contactId: data.contact_id,
    contact: data.contacts ? mapToContact(data.contacts) : undefined,
    ownerId: data.owner_id,
    owner: data.employees ? {
        id: data.employees.id,
        firstName: data.employees.first_name,
        lastName: data.employees.last_name
    } : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToActivity = (data: any): CRMActivity => ({
    id: data.id,
    orgId: data.org_id,
    type: data.type,
    subject: data.subject,
    description: data.description,
    dueDate: data.due_date,
    completed: data.completed,
    dealId: data.deal_id,
    leadId: data.lead_id,
    contactId: data.contact_id,
    performedBy: data.performed_by,
    performer: data.employees ? {
        id: data.employees.id,
        firstName: data.employees.first_name,
        lastName: data.employees.last_name
    } : undefined,
    createdAt: data.created_at
});

// --- Service ---

export const crmService = {
    // Lead Categories
    async getLeadCategories(): Promise<LeadCategory[]> {
        const { data, error } = await supabase
            .from('lead_categories')
            .select('*')
            .order('name');
        if (error) throw error;
        return data.map(mapToLeadCategory);
    },

    async createLeadCategory(name: string, color: string): Promise<LeadCategory> {
        const { data: auth } = await supabase.auth.getUser();
        const { data: profile } = await supabase
            .from('profiles').select('org_id').eq('id', auth.user?.id).single();
        if (!profile) throw new Error('User organization not found');
        const { data, error } = await supabase
            .from('lead_categories')
            .insert({ org_id: profile.org_id, name, color })
            .select().single();
        if (error) throw error;
        return mapToLeadCategory(data);
    },

    async updateLeadCategory(id: string, updates: { name?: string; color?: string }): Promise<LeadCategory> {
        const { data, error } = await supabase
            .from('lead_categories').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return mapToLeadCategory(data);
    },

    async deleteLeadCategory(id: string): Promise<void> {
        const { error } = await supabase.from('lead_categories').delete().eq('id', id);
        if (error) throw error;
    },

    // Lead Locations
    async getLeadLocations(categoryId?: string): Promise<LeadLocation[]> {
        let query = supabase.from('lead_locations').select('*').order('name');
        if (categoryId) query = query.eq('category_id', categoryId);
        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToLeadLocation);
    },

    async createLeadLocation(categoryId: string, name: string): Promise<LeadLocation> {
        const { data: auth } = await supabase.auth.getUser();
        const { data: profile } = await supabase
            .from('profiles').select('org_id').eq('id', auth.user?.id).single();
        if (!profile) throw new Error('User organization not found');
        const { data, error } = await supabase
            .from('lead_locations')
            .insert({ org_id: profile.org_id, category_id: categoryId, name })
            .select().single();
        if (error) throw error;
        return mapToLeadLocation(data);
    },

    async updateLeadLocation(id: string, name: string): Promise<LeadLocation> {
        const { data, error } = await supabase
            .from('lead_locations').update({ name }).eq('id', id).select().single();
        if (error) throw error;
        return mapToLeadLocation(data);
    },

    async deleteLeadLocation(id: string): Promise<void> {
        const { error } = await supabase.from('lead_locations').delete().eq('id', id);
        if (error) throw error;
    },

    // Leads
    async getLeads(orgId?: string) {
        let query = supabase
            .from('leads')
            .select(`
                *,
                employees (id, first_name, last_name),
                lead_categories (id, name, color),
                lead_locations (id, name, category_id)
            `)
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToLead);
    },

    async getLeadById(id: string) {
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                employees (id, first_name, last_name),
                lead_categories (id, name, color),
                lead_locations (id, name, category_id)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToLead(data);
    },

    async createLead(lead: Partial<Lead>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', profile.user?.id)
            .single();

        if (!userProfile) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from('leads')
            .insert({
                org_id: userProfile.org_id,
                first_name: lead.firstName,
                last_name: lead.lastName,
                email: lead.email,
                phone: lead.phone,
                company_name: lead.companyName,
                source: lead.source,
                status: lead.status || 'new',
                owner_id: lead.ownerId,
                notes: lead.notes,
                category_id: lead.categoryId || null,
                location_id: lead.locationId || null,
            })
            .select()
            .single();

        if (error) throw error;
        return mapToLead(data);
    },

    async updateLead(id: string, updates: Partial<Lead>) {
        const dbUpdates: any = {};
        if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
        if (updates.source !== undefined) dbUpdates.source = updates.source;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.ownerId !== undefined) dbUpdates.owner_id = updates.ownerId;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
        if (updates.locationId !== undefined) dbUpdates.location_id = updates.locationId || null;

        const { data, error } = await supabase
            .from('leads')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToLead(data);
    },

    async deleteLead(id: string) {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    },

    async convertLead(leadId: string, dealData: { title: string, value: number, expectedCloseDate?: string }) {
        // 1. Get Lead Data
        const lead = await this.getLeadById(leadId);

        // 2. Create Company
        const company = await this.createCompany({
            name: lead.companyName || `${lead.firstName} ${lead.lastName}'s Company`,
            email: lead.email,
            phone: lead.phone,
        });

        // 3. Create Contact
        const contact = await this.createContact({
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            companyId: company.id
        });

        // 4. Create Deal
        const deal = await this.createDeal({
            title: dealData.title,
            value: dealData.value,
            expectedCloseDate: dealData.expectedCloseDate,
            leadId: leadId,
            companyId: company.id,
            contactId: contact.id,
            ownerId: lead.ownerId
        });

        // 5. Update Lead Status
        await this.updateLead(leadId, { status: 'won' }); // or 'qualified' / 'converted'

        return deal;
    },

    // Deals
    async getDeals(orgId?: string) {
        let query = supabase
            .from('deals')
            .select(`
                *,
                companies (*),
                contacts (*),
                leads (*),
                employees (id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToDeal);
    },

    async getDealsByCompany(companyId: string) {
        const { data, error } = await supabase
            .from('deals')
            .select(`
                *,
                companies (*),
                contacts (*),
                leads (*),
                employees (id, first_name, last_name)
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToDeal);
    },

    async createDeal(deal: Partial<Deal>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', profile.user?.id)
            .single();

        if (!userProfile?.org_id) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from('deals')
            .insert({
                org_id: userProfile?.org_id,
                title: deal.title,
                value: deal.value,
                currency: deal.currency || 'USD',
                stage: deal.stage || 'lead',
                probability: deal.probability || 0,
                quantity: deal.quantity || 1,
                expected_close_date: deal.expectedCloseDate,
                lead_id: deal.leadId,
                company_id: deal.companyId,
                contact_id: deal.contactId,
                owner_id: deal.ownerId
            })
            .select()
            .single();

        if (error) throw error;
        return mapToDeal(data);
    },

    async updateDeal(id: string, updates: Partial<Deal>) {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.value !== undefined) dbUpdates.value = updates.value;
        if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
        if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.expectedCloseDate !== undefined) dbUpdates.expected_close_date = updates.expectedCloseDate;
        if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId;
        if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId;
        if (updates.leadId !== undefined) dbUpdates.lead_id = updates.leadId;
        if (updates.ownerId !== undefined) dbUpdates.owner_id = updates.ownerId;

        const { data, error } = await supabase
            .from('deals')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToDeal(data);
    },

    async updateDealStage(id: string, stage: string) {
        return this.updateDeal(id, { stage });
    },

    // Companies
    async getCompanies(orgId?: string) {
        let query = supabase
            .from('companies')
            .select('*')
            .order('name');

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(mapToCompany);
    },

    async createCompany(company: Partial<Company>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

        if (!userProfile?.org_id) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from('companies')
            .insert({
                org_id: userProfile?.org_id,
                name: company.name,
                industry: company.industry,
                website: company.website,
                phone: company.phone,
                email: company.email,
                address: company.address
            })
            .select()
            .single();

        if (error) throw error;
        return mapToCompany(data);
    },

    async getCompanyById(id: string) {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToCompany(data);
    },

    async updateCompany(id: string, updates: Partial<Company>) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.address !== undefined) dbUpdates.address = updates.address;

        const { data, error } = await supabase
            .from('companies')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToCompany(data);
    },

    async deleteCompany(id: string) {
        // 1. Delete CRM Activities linked to deals or contacts
        const { data: deals } = await supabase.from('deals').select('id').eq('company_id', id);
        if (deals && deals.length > 0) {
            const dealIds = deals.map(d => d.id);
            await supabase.from('crm_activities').delete().in('deal_id', dealIds);
        }
        
        const { data: contacts } = await supabase.from('contacts').select('id').eq('company_id', id);
        if (contacts && contacts.length > 0) {
            const contactIds = contacts.map(c => c.id);
            await supabase.from('crm_activities').delete().in('contact_id', contactIds);
        }

        // 2. Identify all Quotes for this company
        const { data: quotes } = await supabase.from('quotes').select('id').eq('company_id', id);
        const quoteIds = quotes ? quotes.map(q => q.id) : [];

        // 3. Delete Sales Order Items and Sales Orders
        // We need to delete SOs that are linked directly to the company OR to the company's quotes
        let orderIdsToDelete: string[] = [];
        
        const { data: salesOrdersCompany } = await supabase.from('sales_orders').select('id').eq('company_id', id);
        if (salesOrdersCompany) {
            orderIdsToDelete.push(...salesOrdersCompany.map(o => o.id));
        }

        if (quoteIds.length > 0) {
            const { data: salesOrdersQuotes } = await supabase.from('sales_orders').select('id').in('quote_id', quoteIds);
            if (salesOrdersQuotes) {
                orderIdsToDelete.push(...salesOrdersQuotes.map(o => o.id));
            }
        }

        orderIdsToDelete = [...new Set(orderIdsToDelete)]; // deduplicate

        if (orderIdsToDelete.length > 0) {
            await supabase.from('sales_order_items').delete().in('order_id', orderIdsToDelete);
            await supabase.from('sales_orders').delete().in('id', orderIdsToDelete);
        }

        // 4. Delete dependent records (Quotes, Deals, Contacts)
        if (quoteIds.length > 0) {
            await supabase.from('quotes').delete().in('id', quoteIds);
        }
        await supabase.from('deals').delete().eq('company_id', id);
        await supabase.from('contacts').delete().eq('company_id', id);

        // 5. Finally, delete the company itself
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) throw error;
    },

    // Contacts
    async getContacts(orgId?: string) {
        let query = supabase
            .from('contacts')
            .select(`
                *,
                companies (*)
            `)
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToContact);
    },

    async createContact(contact: Partial<Contact>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

        if (!userProfile?.org_id) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from('contacts')
            .insert({
                org_id: userProfile?.org_id,
                first_name: contact.firstName,
                last_name: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                position: contact.position,
                company_id: contact.companyId
            })
            .select()
            .single();

        if (error) throw error;
        return mapToContact(data);
    },

    // Activities
    async getDealActivities(dealId: string) {
        const { data, error } = await supabase
            .from('crm_activities')
            .select(`
                *,
                employees (id, first_name, last_name)
            `)
            .eq('deal_id', dealId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToActivity);
    },

    async createActivity(activity: Partial<CRMActivity>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

        if (!userProfile?.org_id) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from('crm_activities')
            .insert({
                org_id: userProfile?.org_id,
                type: activity.type,
                subject: activity.subject,
                description: activity.description,
                due_date: activity.dueDate,
                deal_id: activity.dealId,
                lead_id: activity.leadId,
                contact_id: activity.contactId,
                performed_by: activity.performedBy
            })
            .select()
            .single();

        if (error) throw error;
        return mapToActivity(data);
    },

    // --- Quotations ---

    async getQuotes(orgId?: string): Promise<Quote[]> {
        let query = supabase
            .from('quotes')
            .select(`
                *,
                company:companies(id, name),
                contact:contacts(id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            orgId: item.org_id,
            quoteNumber: item.quote_number,
            dealId: item.deal_id,
            companyId: item.company_id,
            company: item.company ? {
                id: item.company.id,
                orgId: item.org_id,
                name: item.company.name,
                createdAt: '', updatedAt: ''
            } : undefined,
            contactId: item.contact_id,
            contact: item.contact ? {
                id: item.contact.id,
                orgId: item.org_id,
                firstName: item.contact.first_name,
                lastName: item.contact.last_name,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            } : undefined,
            issueDate: item.issue_date,
            validUntil: item.valid_until,
            status: item.status,
            totalAmount: item.total_amount,
            currency: item.currency,
            notes: item.notes,
            // New fields
            scopeOfWork: item.scope_of_work,
            paymentTerms: item.payment_terms,
            terms: item.terms,
            taxRate: item.tax_rate,

            items: item.items || [],
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));
    },

    async createQuote(quote: Partial<Quote>): Promise<Quote> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");

        const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', userData.user.id)
            .single();

        if (!profile?.org_id) throw new Error("Organization ID not found");

        const quoteNumber = quote.quoteNumber || `Q-${Date.now()}`;

        const { data, error } = await supabase
            .from('quotes')
            .insert({
                org_id: profile.org_id,
                quote_number: quoteNumber,
                deal_id: quote.dealId,
                company_id: quote.companyId,
                contact_id: quote.contactId,
                issue_date: quote.issueDate,
                valid_until: quote.validUntil,
                status: quote.status || 'draft',
                total_amount: quote.totalAmount,
                currency: quote.currency || 'USD',
                notes: quote.notes,
                items: quote.items,
                // New fields
                scope_of_work: quote.scopeOfWork,
                payment_terms: quote.paymentTerms,
                terms: quote.terms,
                tax_rate: quote.taxRate
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            id: data.id,
            orgId: data.org_id,
            quoteNumber: data.quote_number,
            items: data.items,
            totalAmount: data.total_amount,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        } as unknown as Quote;
    },

    async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.items) dbUpdates.items = updates.items;
        if (updates.totalAmount) dbUpdates.total_amount = updates.totalAmount;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.validUntil) dbUpdates.valid_until = updates.validUntil;
        // New fields
        if (updates.scopeOfWork !== undefined) dbUpdates.scope_of_work = updates.scopeOfWork;
        if (updates.paymentTerms !== undefined) dbUpdates.payment_terms = updates.paymentTerms;
        if (updates.terms !== undefined) dbUpdates.terms = updates.terms;
        if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate;

        const { data, error } = await supabase
            .from('quotes')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            id: data.id,
            orgId: data.org_id,
            quoteNumber: data.quote_number,
            items: data.items,
            totalAmount: data.total_amount,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        } as unknown as Quote;
    }
};
