import { supabase } from "@/lib/supabase";
import type { Lead, Deal, Contact, Company, CRMActivity, Quote } from "../types";

// --- Helpers ---

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
    // Leads
    async getLeads() {
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                employees (id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToLead);
    },

    async createLead(lead: Partial<Lead>) {
        const { data: profile } = await supabase.auth.getUser();
        // Assuming profile fetch logic for org_id if needed, but RLS handles view.
        // For insert, we need org_id. Let's fetch it from user profile table.
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
                notes: lead.notes
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

    // Deals
    async getDeals() {
        const { data, error } = await supabase
            .from('deals')
            .select(`
                *,
                companies (*),
                contacts (*),
                leads (*),
                employees (id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

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

        const { data, error } = await supabase
            .from('deals')
            .insert({
                org_id: userProfile?.org_id,
                title: deal.title,
                value: deal.value,
                currency: deal.currency || 'USD',
                stage: deal.stage || 'lead',
                probability: deal.probability || 0,
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
    async getCompanies() {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name');

        if (error) throw error;
        return data.map(mapToCompany);
    },

    async createCompany(company: Partial<Company>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

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
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) throw error;
    },

    // Contacts
    async getContacts() {
        const { data, error } = await supabase
            .from('contacts')
            .select(`
                *,
                companies (*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToContact);
    },

    async createContact(contact: Partial<Contact>) {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

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

    async getQuotes(): Promise<Quote[]> {
        const { data, error } = await supabase
            .from('quotes')
            .select(`
                *,
                company:companies(id, name),
                contact:contacts(id, first_name, last_name)
            `)
            .order('created_at', { ascending: false });

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
                createdAt: '', updatedAt: ''
            } : undefined,
            issueDate: item.issue_date,
            validUntil: item.valid_until,
            status: item.status,
            totalAmount: item.total_amount,
            currency: item.currency,
            notes: item.notes,
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
                items: quote.items
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
