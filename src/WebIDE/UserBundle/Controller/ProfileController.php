<?php

namespace WebIDE\UserBundle\Controller;

use FOS\UserBundle\Controller\ProfileController as BaseProfileController;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProfileController extends Controller
{
    /**
     * Show the user
     */
    public function showAction($username)
    {
        $user = $this->container->get('fos_user.user_manager')->findUserByUsername($username);
        if(!$user) {
            throw new NotFoundHttpException();
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT OUTER JOIN p.files f JOIN p.version pv JOIN f.version fv WHERE fv.id = pv AND p.user = :user");
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH p.version = f.version AND p.user = :user");
        $query->setParameter("user", $user);

        $projects = $query->getResult();


        return $this->container->get('templating')->renderResponse('FOSUserBundle:Profile:show.html.'.$this->container->getParameter('fos_user.template.engine'), array(
            'user' => $user,
            'projects' => $projects
        ));
    }

    public function showSelfAction()
    {
        $user = $this->container->get('security.context')->getToken()->getUser();
        if (!is_object($user) || !$user instanceof UserInterface) {
            throw new AccessDeniedException('This user does not have access to this section.');
        }

        return $this->showAction($user->getUsername());
    }

    /**
     * Edit the user
     */
    public function editAction()
    {
        $user = $this->container->get('security.context')->getToken()->getUser();
        if (!is_object($user) || !$user instanceof UserInterface) {
            throw new AccessDeniedException('This user does not have access to this section.');
        }

        $form = $this->container->get('fos_user.profile.form');
        $formHandler = $this->container->get('fos_user.profile.form.handler');

        $process = $formHandler->process($user);
        if ($process) {
            $this->setFlash('fos_user_success', 'profile.flash.updated');

            return new RedirectResponse($this->container->get('router')->generate('fos_user_profile_show'));
        }

        return $this->container->get('templating')->renderResponse(
            'FOSUserBundle:Profile:edit.html.'.$this->container->getParameter('fos_user.template.engine'),
            array('form' => $form->createView())
        );
    }

    protected function setFlash($action, $value)
    {
        $this->container->get('session')->setFlash($action, $value);
    }
}
