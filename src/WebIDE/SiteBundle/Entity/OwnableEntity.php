<?php
namespace WebIDE\SiteBundle\Entity;

interface OwnableEntity
{
    function getUser();
    function setUser(User $user);
}