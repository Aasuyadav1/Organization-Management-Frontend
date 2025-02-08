export interface Organization {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  owner: string;
  members: OrganizationMember[];
}

export interface OrganizationMember {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  role: 'owner' | 'admin' | 'member';
}

export interface CreateOrganization {
  name: string;
  description: string;
  logo?: string;
}

export interface UpdateOrganization extends Partial<CreateOrganization> {}
