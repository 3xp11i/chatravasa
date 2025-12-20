# Hostel Management Software 

This app will be for both the owner and residents.

## Admin Flow

- I add the admin's name & phone number to the database
- Admin logs in with the phone number and OTP
- They can add their profile picture
- They create a new Hostel - 
  - Hostel Name
  - Hostel Location
  - Number of Rooms
  <!-- - the first room number (to generate the sequence of room numbers, for e.g. if first room number is 100 and there are 20 rooms then they will generated as - Room 101, Room 102, etc. ) -->
  - A Photo of the Hostel
  <!-- - Hostel Fee for Single and Double Occupancy -->
  <!-- - Available Rooms -->

Then in the **Residents Management** Section, they add, update or delete the residents and their details.

For each Resident, they need to give -
- Resident's Full Name
- Resident's Phone Number
- Resident's Room Number
- Resident's Arrival Date (Optional)

### Admin View
- The home page will have all the main pages listed


**Manage Residents Page**

- This page lists all the residents with their Room No., Full Name and Profile Picture (if available), their in-room status and arrival date.
- Admin can search or filter through the Resident list
- Admin can click and open a Resident's profile, which will show all their details. They can edit their details, or remove them.


**Fees Management Page**

- Shows how many residents have paid their monthly fees
- A List of Residents with their fee paid status, with a checkbox for each one who haven't paid their fee.
- Admin can choose Yes for each Resident when they pay they fee, and the status will change for them for a month, after which it resets on the next date. The date when the status is changed is also stored for analytical purposes.


**Complaints Page**

- Shows all the complaints of the hostel, both common and individual complaints divided into two sections.
- Admin can reply to a complaint, or set its status.


**Manage Meals Page**

- Admin can add meals, which will require these data sets:
  - Meal Title (Breakfast, Dinner, etc.)
  - Meal Timing (8:00 AM, 9:00 PM)
  - Meal Update Deadline (number of hours before the meal uptil residents can update their meal status for that meal)


## Main features
There are few core features of this app in the beginning.

- Meals Management
- Complaints Management
- Residents Management (for Admin)
- Fees Management (for Admin)


### Meals Management
This will be for Residents to view the weekly meals, and tell in advance if they are going to have the upcoming meals or not. Owner can update the weekly meals, and view the meal status of all residents in one view. There will be one today's meal status page where the numbers will be displayed in totality for the cook to keep the amount according to the number of residents.



**For Admin**
- Create meal plan of each day of the week
- Set latest time for residents to update their next meal's status. For e.g. latest time to update dinner status will be 6 PM, after residents' meal status will remain what it was before it and they won't be able to change it. This is to avoid issues like residents changing their meal status very late and then complaining of not getting food.
- A **Meal Status Page** where the numbers will be shown for how many Residents are going to have meals for the day. This page will be password-protected, set by the Admin, and can be given to the cook to access the page (only need to enter the password once) and prepare the food accordingly. 





**For Residents**

- Choose Yes/No for today's, tomorrow's and weekly meals.
- View the Weekly meals plan created by the admin.





![Meals Page for Residents](app\assets\images\rs_meals_page.png)


### Complaints

Complaints management is a major headache for owners. This feature deals with that problem and makes it easier for the owner remember and handle complaints.

Types of complaints -

- Common: Problems faced by multiple residents 
  - Wifi
  - Water related (drinking water, bathroom, toilet, etc.)
  - Electricity
- Individual: Problems faced by an individual resident
  - Water related (bathroom, etc.)
  - Room service & cleaning
  - Electricity



Each complaint will have the following data -
- Title
- Description
- Photo (Max 2)  or Video (Optional)
- Date raised (automatically generated upon creation)
- Complainant (The person who raises the complaint)
- Type of Complaint (One of the types defined by the owner, or other as default)
- Complaint Status (Unresolved, Ongoing, Resolved, set by the Admin)
- Replies by the admin and resident(s).


**For Admin** 

- Admin can create types of complaints in the hostel based on the problems they face.
- Admin can acknowledge and comment on a complaint.
- Admin can search through, filter or sort the complaints


**For Residents**

- Residents can raise and *mark as fixed* common or individual complaints.
- Residents can vote common complaints to show that they are having the same complaint (to prevent repeated complaints)
- 


![Complaints Page for Residents](app\assets\images\rs_complaints_page.png)
- Choose Yes/No for today's, tomorrow's and weekly meals.
