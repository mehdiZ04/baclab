# Courses Feature Documentation

## Overview
The courses feature allows you to organize educational content into modules and chapters. Each chapter contains a video that students can watch.

## Database Structure

### CourseModule
- **moduleNumber**: Unique identifier (0, 1, 2, 3...)
- **title**: Module name
- **description**: Brief description
- **order**: For sorting modules
- **chapters**: Related chapters/videos

### CourseChapter
- **moduleId**: Links to parent module
- **title**: Chapter/video title
- **description**: Chapter description
- **videoUrl**: YouTube, Vimeo, Google Drive, or direct video URL
- **duration**: Video length (e.g., "15:30")
- **order**: For sorting within module
- **views**: Number of times watched

## Curriculum Structure

### Module 0: Planification
- Introduction to the program and platform

### Module 1: Introduction à l'Algorithmique
- Algorithm definition
- Algorithm steps (input → processing → output)
- Pseudo-code concepts
- Writing clear algorithms

### Module 2: Les Variables & Types de Données
- Declaration & assignment
- Reading & writing
- Type conversion

### Module 3: Opérations Arithmétiques & Logiques
- Arithmetic operators (+, –, ×, ÷, mod)
- Comparison operators (>, <, >=, ==...)
- Logical operators (AND, OR, NOT)

### Module 4: Les fonctions prédéfinies
- Convch, Estnum, Valeur functions
- Long, Sous_chaine, Effacer, Majus functions
- ord and chr functions

### Module 5: Instructions Conditionnelles
- IF / ELSE structure
- Nested conditions
- Decision-making algorithms

### Module 6: Boucles
- FOR loop
- WHILE loop
- REPEAT...UNTIL loop
- Counters & accumulators

### Module 7: Fonctions & Procédures
- Importance of decomposition
- Function declaration and usage
- Procedure declaration and usage
- Difference between function and procedure

### Module 8: Les Tableaux
- Array declaration
- Filling / displaying
- Simple search

### Module 9: Les Algorithmes de Tri
- Selection sort
- Insertion sort
- Bubble sort

### Module 10: Les Algorithmes de recherche
- Sequential search
- Binary search

## For Students

### Accessing Courses
1. Log in to the platform
2. Navigate to Dashboard
3. Click on the **Courses** tab
4. Browse modules in the curriculum
5. Click on any chapter to watch the video
6. Video views are tracked automatically

## For Admins/Instructors

### Adding Videos to Modules
1. Go to Admin Panel
2. Click on **Manage Courses** tab
3. Fill in the form:
   - Select the module
   - Enter chapter title
   - Add video URL (YouTube, Vimeo, Google Drive, or direct link)
   - Optional: Add duration and description
   - Set order for sorting
4. Click **Add Chapter**

### Deleting Videos
1. Go to Admin Panel → Manage Courses
2. Find the chapter you want to delete
3. Click the trash icon next to it
4. Confirm deletion

## Video URL Formats Supported

### YouTube
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

### Vimeo
- `https://vimeo.com/VIDEO_ID`

### Google Drive
- `https://drive.google.com/file/d/FILE_ID/view`

### Direct MP4
- Any direct link to `.mp4` file

## Commands

### Initialize Curriculum
```bash
node prisma/seed-courses.js
```

### Add New Module (via API)
```javascript
POST /api/courses
{
  "moduleNumber": 11,
  "title": "New Module",
  "description": "Description here",
  "order": 11
}
```

### Add Chapter to Module (via Admin Panel or API)
```javascript
POST /api/courses/chapters
{
  "moduleId": "module_id_here",
  "title": "Chapter Title",
  "videoUrl": "https://youtube.com/watch?v=...",
  "duration": "20:30",
  "order": 1
}
```

### Delete Chapter
```javascript
DELETE /api/courses/chapters?id=chapter_id_here
```

## Features

✅ Organized curriculum with 11 modules  
✅ Expandable/collapsible module structure  
✅ Video player with YouTube/Vimeo/Google Drive support  
✅ View counter for each video  
✅ Admin panel to add/remove videos  
✅ Clean, modern UI with smooth animations  
✅ Mobile responsive design  

## Notes

- All modules have been pre-created based on your curriculum
- Admins need to add videos to each chapter
- Students cannot download videos (controlled by `controlsList="nodownload"`)
- View counts increment automatically when students watch
