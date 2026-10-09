const myprofile = () => socialService('/utilisateurs/mon-profil');

const updateMyProfile = (profileData) => socialService('/utilisateurs/mon-profil', {
    method: 'PUT',
    body: JSON.stringify(profileData),
});

const deleteMyProfile = () => socialService('/utilisateurs/mon-profil', {
    method: 'DELETE',
});





