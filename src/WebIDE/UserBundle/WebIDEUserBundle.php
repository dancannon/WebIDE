<?php

namespace WebIDE\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class WebIDEUserBundle extends Bundle
{
    public function getParent()
    {
        return 'FOSUserBundle';
    }
}
