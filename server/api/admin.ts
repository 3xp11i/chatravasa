// Nuxt Server API route for admin-related functionalities
import {
	serverSupabaseClient,
	serverSupabaseServiceRole,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
	const client = serverSupabaseServiceRole(event);


	let results = [];
	for (let i = 1; i <= 30; i++) {
		const phone = `+9110000000${i.toString().padStart(2, "0")}`;
		const { data, error } = await client.from("resident_invites").insert({
			first_name: "Dummy",
			last_name: `Resident${i}`,
			phone,
			room: `A${Math.ceil(i / 5)}`,
			joining_date: new Date().toISOString().slice(0, 10),
			guardian_name: `Parent${i}`,
			family_phone_number: `+9199999999${i.toString().padStart(2, "0")}`,
			hostel_id: "3f61f264-79bd-4c1e-969e-b713c2fd45df",
			created_at: new Date().toISOString(),
		});
		results.push({ phone, error });
	}
	return results;


	// let phoneOtpPairs: string[] = [];
	// let errors: any[] = [];
	// for (let i = 1; i <= 30; i++) {
	// 	const phone = `+91${(1000000000 + i).toString().padStart(10, '0')}`;
	// 	const { data, error } = await client.auth.admin.createUser({
	// 		phone,
	// 		phone_confirm: true,
	// 		user_metadata: {
	// 			first_name: "Test",
	// 			last_name: `Resident${i}`,
	// 			is_admin: false,
	// 		},
	// 	});
	// 	if (error) {
	// 		errors.push({ phone, error });
	// 	}
	// 	phoneOtpPairs.push(`${phone.replace('+91','')}=111111`);
	// }
	// const joined = phoneOtpPairs.join(',');
	// return {
	// 	phoneOtpString: joined,
	// 	errors
	// };
});