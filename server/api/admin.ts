// Nuxt Server API route for admin-related functionalities
import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
	const headers = getRequestHeaders(event);
	const client = serverSupabaseServiceRole(event);

	const { data, error } = await client.auth.admin.createUser({
		phone: "+919170147764",
		phone_confirm: true,
		user_metadata:{
			first_name: "Prakhar", 
			last_name: "Tiwari", 
			is_admin: true
		}
	});
	return { 
        query,
        headers,
        data,
        error
     };
});
